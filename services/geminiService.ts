
import { Gender, UserRole } from '../types';

const ACADEMIC_PLACEHOLDER_AR = "أهلاً بك. أنا جارفيس، مساعدك الذكي في منصة 'جامعتك الرقمية way'. حالياً، خدمة الذكاء الاصطناعي غير مفعلة. عند تفعيلها، سأقدم لك استشارات أكاديمية بالاعتماد على مصادر البحث الجزائرية.";

export const askJarvis = async (prompt: string, userName: string, gender: Gender, role: UserRole): Promise<{ text: string }> => {
    try {
        // The frontend now calls our own secure API route instead of Google directly.
        const response = await fetch('/api/jarvis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, userName, gender, role }),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                // The backend now sends a friendly error message in the 'error' field for any API-related issue.
                return { text: errorData.error || `Service unavailable (status: ${response.status})` };
            } catch (jsonError) {
                 // The response was not JSON, maybe a Vercel function crash page (HTML) or plain text.
                console.error("Could not parse error response from API as JSON:", jsonError);
                return { text: `Service unavailable (status: ${response.status}). The server returned an unexpected response.` };
            }
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error calling our Jarvis API route:", error);
        return { text: "An error occurred while communicating with Jarvis. Please check your connection and try again." };
    }
};