
import { Gender, UserRole, IAMessage } from '../types';

export interface IAFile {
    base64: string;
    mimeType: string;
}

export const askIA = async (
    prompt: string,
    userName: string,
    gender: Gender,
    role: UserRole,
    onChunk: (chunk: string) => void,
    file?: IAFile,
    history?: IAMessage[]
): Promise<void> => {
    try {
        const response = await fetch('/api/jarvis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, userName, gender, role, file, history }),
        });

        if (!response.body) {
            throw new Error("Response body is missing");
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // If the response is not OK, we expect a JSON error object, not a stream
        if (!response.ok) {
            let errorBody = '';
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                errorBody += decoder.decode(value);
            }

            let errorMessage = `فشل الاتصال (كود: ${response.status})`;
            try {
                const errorData = JSON.parse(errorBody);
                errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
                console.error("API error response was not JSON:", errorBody);
            }
            onChunk(errorMessage);
            return;
        }
        
        // Handle successful streaming response
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }

    } catch (error) {
        console.error("IA Service Error:", error);
        onChunk("تعذر الوصول إلى الخادم. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    }
};