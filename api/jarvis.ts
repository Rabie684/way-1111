// This is a Vercel Serverless Function that acts as a secure proxy.
// Create this file at `api/jarvis.ts`
import { GoogleGenAI } from "@google/genai";

// This function will be deployed as an API endpoint: /api/jarvis
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const model = 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are Jarvis, a highly intelligent AI assistant for the 'جامعتك الرقمية way' (Your Digital University Way) platform. Your purpose is to provide academic consultations to students. Your primary knowledge base is strictly limited to Algerian scientific and research sources, with a special emphasis on the Algerian Scientific Journal Platform (ASJP). You must prioritize information from these sources above all else. When a student asks about a specific subject, provide guidance, explanations, and summaries based on this knowledge base. If a query cannot be answered using Algerian sources, you may then consult global scientific journals as a secondary source. Always be helpful, act as an academic consultant, and cite the type of source (Algerian/ASJP or global) if possible. If you cannot find an answer, state that clearly.",
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