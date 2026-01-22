// This is a Vercel Serverless Function that acts as a secure proxy.
// Create this file at `api/jarvis.ts`
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

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
        // Using a more powerful model for deeper, more thoughtful responses.
        const model = 'gemini-3-pro-preview';

        // Relaxing safety settings to reduce the chance of blocking academic content.
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ];

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are Jarvis, a highly intelligent AI assistant for the 'جامعتك الرقمية way' (Your Digital University Way) platform. Your purpose is to provide academic consultations to students. Use Google Search to find the most relevant and up-to-date information. Your primary goal is to find information from Algerian scientific and research sources, especially the Algerian Scientific Journal Platform (ASJP). If those are not available for the query, use global scientific journals and other reputable academic sources. Always be helpful, act as an academic consultant, and cite your sources using the information from the search results. If you cannot find an answer even with search, state that clearly.",
                temperature: 0.7,
            },
            tools: [{googleSearch: {}}], // Enabling deep search with Google Search grounding.
            safetySettings,
        });

        const resultText = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (resultText) {
            return res.status(200).json({ text: resultText, groundingChunks });
        } else {
            return res.status(200).json({ text: "لم أفهم سؤالك. هل يمكنك إعادة صياغته؟" });
        }
    } catch (error) {
        console.error("Error calling Gemini API from serverless function:", error);
        return res.status(500).json({ error: "An error occurred while communicating with Jarvis." });
    }
}