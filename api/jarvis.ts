// This is a Vercel Serverless Function that acts as a secure proxy.
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, userName, gender, role, file, history } = req.body;

    if (!prompt && !file) {
        return res.status(400).json({ error: 'Either a prompt or a file is required.' });
    }
    
    if (!userName || !gender || !role) {
        return res.status(400).json({ error: 'البيانات المطلوبة ناقصة (الاسم، الجنس، أو الدور).' });
    }

    // Important: Trim any whitespace from the key that might come from Vercel env variables
    const apiKey = process.env.API_KEY?.trim();

    if (!apiKey) {
        console.error('SERVER_ERROR: API_KEY is missing in environment variables.');
        return res.status(503).json({ 
            error: "عذراً، مفتاح الربط الذكي غير مهيأ على الخادم. يرجى التأكد من إضافة API_KEY في إعدادات Vercel." 
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = 'gemini-3-flash-preview';

        let userTitle = '';
        if (role === 'professor') {
            userTitle = gender === 'female' ? 'الأستاذة' : 'الأستاذ';
        } else {
            userTitle = gender === 'female' ? 'الطالبة' : 'الطالب';
        }

        const welcomeGreeting = gender === 'female' ? 'أهلاً بكِ' : 'أهلاً بك';

        const systemInstruction = `You are Jarvis, an intelligent AI assistant for the 'جامعتك الرقمية way' platform. You are speaking with ${userTitle} ${userName}. Always address them by their name and title in a friendly, conversational tone (e.g., "${welcomeGreeting} ${userTitle} ${userName}، بخصوص سؤالك..."). Your goal is to provide academic consultations. Your primary knowledge base is the Algerian Scientific Journal Platform (ASJP). When answering, you MUST explicitly state that your information is from the ASJP, for example: "بالاعتماد على منصة المجلات العلمية الجزائرية (ASJP)...". If you use other sources, you must mention them. You might receive images or PDF files to analyze along with the user's prompt; respond to them accordingly. Always be helpful and academic. If you can't find an answer, say so clearly. Respond exclusively in Arabic.`;
        
        const geminiHistory = (history || []).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const currentUserParts: any[] = [];
        if (file) {
            currentUserParts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.base64,
                },
            });
        }
        if (prompt) {
            currentUserParts.push({ text: prompt });
        }
        
        const fullContents = [
            ...geminiHistory,
            {
                role: 'user',
                parts: currentUserParts,
            },
        ];


        const response = await ai.models.generateContent({
            model: modelName,
            contents: fullContents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        });

        const resultText = response.text;
        
        if (resultText) {
            return res.status(200).json({ text: resultText });
        } else {
            console.warn("AI_WARNING: Empty response text from Gemini.");
            let feedback = "لم أتمكن من إنشاء رد لسؤالك. الرجاء محاولة طرح سؤال آخر.";
            if (response.candidates?.[0]?.finishReason === 'SAFETY') {
                feedback = "تم حظر الرد لأسباب تتعلق بالسلامة الأكاديمية. الرجاء إعادة صياغة سؤالك.";
            }
            return res.status(200).json({ text: feedback });
        }
    } catch (error: any) {
        console.error("--- Gemini API Failure ---");
        // The error from the SDK might contain a `response` object with status
        const status = error?.response?.status;
        console.error("Status Code:", status);
        console.error("Message:", error?.message);
        
        // Handle Rate Limiting for Free Tier
        if (status === 429) {
            return res.status(429).json({ 
                error: "تم تجاوز حد الطلبات للنسخة المجانية. يرجى الانتظار دقيقة واحدة والمحاولة مرة أخرى." 
            });
        }

        // Handle invalid API Key (often returns 400 for bad format/permissions)
        if (status === 400 || status === 401) {
            return res.status(401).json({ 
                error: "مفتاح API الخاص بـ Google AI Studio غير صالح أو منتهي الصلاحية." 
            });
        }

        return res.status(500).json({ 
            error: "حدث خطأ غير متوقع أثناء الاتصال بجارفيس. يرجى المحاولة لاحقاً." 
        });
    }
}