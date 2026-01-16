

import { GoogleGenAI } from "@google/genai";

const ACADEMIC_PLACEHOLDER_AR = "أهلاً بك. أنا جارفيس، مساعدك الذكي في منصة 'جامعتك الرقمية way'. حالياً، خدمة الذكاء الاصطناعي غير مفعلة. عند تفعيلها، سأقدم لك استشارات أكاديمية بالاعتماد على مصادر البحث الجزائرية.";

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
            return resultText;
        } else {
             return "Could not get a valid response from the AI.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while communicating with Jarvis. Please check the console for details.";
    }
};