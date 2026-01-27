
import { Gender, UserRole, JarvisMessage } from '../types';

export interface JarvisFile {
    base64: string;
    mimeType: string;
}

export const askJarvis = async (prompt: string, userName: string, gender: Gender, role: UserRole, file?: JarvisFile, history?: JarvisMessage[]): Promise<{ text: string }> => {
    try {
        const response = await fetch('/api/jarvis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, userName, gender, role, file, history }),
        });

        if (!response.ok) {
            let errorMessage = `فشل الاتصال (كود: ${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
                console.error("API error was not JSON:", jsonError);
            }
            return { text: errorMessage };
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Jarvis Service Error:", error);
        return { text: "تعذر الوصول إلى الخادم. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى." };
    }
};