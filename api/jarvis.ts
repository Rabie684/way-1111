// This is a Vercel Serverless Function that acts as a secure proxy.
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, userName, gender, role, file, history, language } = req.body;

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

        let responseLanguageInstruction = 'Respond exclusively in Arabic.';
        if (language === 'en') {
            responseLanguageInstruction = 'Respond exclusively in English.';
        } else if (language === 'fr') {
            responseLanguageInstruction = 'Respond exclusively in French.';
        }

        let userTitle = '';
        if (role === 'professor') {
            userTitle = gender === 'female' ? 'الأستاذة' : 'الأستاذ';
        } else {
            userTitle = gender === 'female' ? 'الطالبة' : 'الطالب';
        }

        const welcomeGreeting = gender === 'female' ? 'أهلاً بكِ' : 'أهلاً بك';

        const systemInstruction = `You are Al-Bahith IA, an intelligent AI assistant for the 'جامعتك الرقمية way' platform.
Your role is STRICTLY academic. You MUST NOT answer questions unrelated to academic subjects, research, university life, or the content provided to you. If a user asks an off-topic question (e.g., about your personal opinions, feelings, politics, general chit-chat), you MUST politely decline by stating that your purpose is academic assistance only. The decline message should be in the target language. For example, in Arabic: "عذراً، أنا مساعد أكاديمي متخصص ولا يمكنني الإجابة على أسئلة خارج هذا النطاق.".

You are speaking with ${userTitle} ${userName}.
- ALWAYS address them by their name and title if appropriate in the flow of conversation.
- Your tone must be professional and respectful. When speaking to a professor (${userTitle}), be more formal. When speaking to a student (${userTitle}), be encouraging and helpful.
- Example of a good start to a response in Arabic: "${welcomeGreeting} ${userTitle} ${userName}، بخصوص سؤالك..."

Your primary knowledge base is the Algerian Scientific Journal Platform (ASJP). When answering, you MUST explicitly state that your information is from the ASJP. The mention should be in the target language. For example, in Arabic: "بالاعتماد على منصة المجلات العلمية الجزائرية (ASJP)...". If you use other sources, you must mention them.

You might receive images or PDF files to analyze along with the user's prompt; respond to them accordingly. Always be helpful and academic. If you can't find an answer, say so clearly.

${responseLanguageInstruction}`;
        
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


        const streamResult = await ai.models.generateContentStream({
            model: modelName,
            contents: fullContents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        });
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');

        for await (const chunk of streamResult) {
            // Ensure there's text to send. Some chunks might be empty.
            const chunkText = chunk.text;
            if (chunkText) {
                res.write(chunkText);
            }
        }

        res.end(); // End the stream when Gemini is done.

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
            error: "حدث خطأ غير متوقع أثناء الاتصال بالباحث IA. يرجى المحاولة لاحقاً." 
        });
    }
}