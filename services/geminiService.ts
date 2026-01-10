
import { GoogleGenAI } from "@google/genai";

const ACADEMIC_PLACEHOLDER_AR = "أهلاً بك. أنا جارفيس، مساعدك الأكاديمي. حالياً، خدمة الذكاء الاصطناعي غير مفعلة. يرجى العلم أن هذه الإجابة هي مثال توضيحي. عند تفعيل الخدمة، سأقوم بالإجابة على استفساراتك بالاعتماد على المجلات العلمية المعتمدة.";

export const askJarvis = async (prompt: string): Promise<string> => {
    // Safely check for the API key. In a browser environment without a build tool, `process` is not defined.
    // This check prevents a runtime error that causes a white screen on app load.
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    if (!apiKey) {
        return ACADEMIC_PLACEHOLDER_AR;
    }
        
    try {
        // Initialize the AI client here, only when we know we have a key and need to make a call.
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
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