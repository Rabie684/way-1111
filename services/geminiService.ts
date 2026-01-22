
const ACADEMIC_PLACEHOLDER_AR = "أهلاً بك. أنا جارفيس، مساعدك الذكي في منصة 'جامعتك الرقمية way'. حالياً، خدمة الذكاء الاصطناعي غير مفعلة. عند تفعيلها، سأقدم لك استشارات أكاديمية بالاعتماد على مصادر البحث الجزائرية.";

export const askJarvis = async (prompt: string): Promise<{ text: string }> => {
    try {
        // The frontend now calls our own secure API route instead of Google directly.
        const response = await fetch('/api/jarvis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            // If the key is not set on Vercel, use the placeholder.
            if (response.status === 500 && errorData.error.includes('API key is not configured')) {
                return { text: ACADEMIC_PLACEHOLDER_AR };
            }
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error calling our Jarvis API route:", error);
        return { text: `An error occurred while communicating with Jarvis: ${error instanceof Error ? error.message : String(error)}` };
    }
};