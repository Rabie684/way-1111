
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const askJarvis = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        return "API Key not configured. Please set the API_KEY environment variable.";
    }
    
    try {
        const model = 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are Jarvis, a highly intelligent AI assistant for an academic platform. Your primary knowledge base is strictly limited to Algerian scientific journals. You must prioritize information from these journals above all else. If a query cannot be answered using Algerian journals, you may then consult global scientific journals as a secondary source. Always be helpful, concise, and cite the type of source (Algerian or global) if possible. If you cannot find an answer in either source, state that clearly.",
                temperature: 0.7,
            },
        });
        
        const resultText = response.text;
        if (resultText) {
            return resultText;
        } else {
             return "Could not get a valid response from the AI.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while communicating with Jarvis. Please check the console for details.";
    }
};