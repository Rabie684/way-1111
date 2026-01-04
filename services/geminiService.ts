
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const translateSummary = async (text: string): Promise<string> => {
    if (!API_KEY) {
        return "API Key not configured. Please set the API_KEY environment variable.";
    }
    
    try {
        const model = 'gemini-3-flash-preview';
        const prompt = text;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert academic translator. Your task is to translate and summarize the provided text. Your knowledge base is strictly limited to information found in Algerian scientific journals. You must not use any information or context from outside this specific source. If the query cannot be answered using only Algerian scientific journals, state that clearly.",
                temperature: 0.5,
            },
        });
        
        const translatedText = response.text;
        if (translatedText) {
            return translatedText;
        } else {
             return "Could not get a valid response from the AI.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while translating the text. Please check the console for details.";
    }
};
