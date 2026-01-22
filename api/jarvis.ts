// This is a Vercel Serverless Function that acts as a secure proxy.
// Create this file at `api/jarvis.ts`
import { GoogleGenAI } from "@google/genai";

// This function will be deployed as an API endpoint: /api/jarvis
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, userName } = req.body;

    if (!prompt || !userName) {
        return res.status(400).json({ error: 'Prompt and user name are required' });
    }

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const model = 'gemini-3-flash-preview';

        const systemInstruction = `You are Jarvis, an intelligent AI assistant for the 'جامعتك الرقمية way' platform. You are speaking with a student named ${userName}. Always address them by their name in a friendly, conversational tone (e.g., "أهلاً ${userName}، بخصوص سؤالك..."). Your goal is to provide academic consultations. Your primary knowledge base is the Algerian Scientific Journal Platform (ASJP). When answering ${userName}, you MUST explicitly state that your information is from the ASJP, for example: "بالاعتماد على منصة المجلات العلمية الجزائرية (ASJP)...". If you use other sources, you must mention them. Always be helpful and academic. If you can't find an answer, say so clearly. Respond exclusively in Arabic.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
        });

        const resultText = response.text;
        if (resultText) {
            return res.status(200).json({ text: resultText });
        } else {
            return res.status(200).json({ text: "لم أفهم سؤالك. هل يمكنك إعادة صياغته؟" });
        }
    } catch (error) {
        console.error("Error calling Gemini API from serverless function:", error);
        return res.status(500).json({ error: "An error occurred while communicating with Jarvis." });
    }
}