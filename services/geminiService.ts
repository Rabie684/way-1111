
import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, API key must be obtained from process.env.API_KEY and is assumed to be present.
// Simplified initialization according to the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ACADEMIC_PLACEHOLDER_AR = "أهلاً بك. أنا جارفيس، مساعدك الأكاديمي. حالياً، خدمة الذكاء الاصطناعي غير مفعلة. يرجى العلم أن هذه الإجابة هي مثال توضيحي. عند تفعيل الخدمة، سأقوم بالإجابة على استفساراتك بالاعتماد على المجلات العلمية المعتمدة.";

export const askJarvis = async (prompt: string): Promise<string> => {
    // Fulfilling user request to return a placeholder if API key is not set.
    if (!process.env.API_KEY) {
        return ACADEMIC_PLACEHOLDER_AR;
    }
        
    try {
        // FIX: Per coding guidelines, 'gemini-1.5-flash' is a prohibited model.
        // Using 'gemini-3-flash-preview' for basic text tasks.
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