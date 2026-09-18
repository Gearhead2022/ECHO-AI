import {
    ChatMessage,
    ChatResponse,
    ILLMProvider,
    ChatOptions,
} from "./interfaces/ILLMProvider";

export class OllamaProvider implements ILLMProvider {

    async chat(
        messages: ChatMessage[],
        options?: ChatOptions
    ): Promise<ChatResponse> {

        const url = process.env.OLLAMA_URL;
        const model = process.env.OLLAMA_MODEL;

        if (!url) {
            throw new Error("OLLAMA_URL is not defined");
        }

        if (!model) {
            throw new Error("OLLAMA_MODEL is not defined");
        }

        const response = await fetch(`${url}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
                ...options,
            }),
        });

        if (!response.ok) {
            throw new Error("Ollama Error");
        }

        const data = await response.json();

        return {
            text: data.message.content,
        };
    }

    async *chatStream(
        messages: ChatMessage[],
        options?: ChatOptions
    ): AsyncGenerator<string> {

        const url = process.env.OLLAMA_URL;
        const model = process.env.OLLAMA_MODEL;

        if (!url) {
            throw new Error("OLLAMA_URL is not defined");
        }

        if (!model) {
            throw new Error("OLLAMA_MODEL is not defined");
        }

        const response = await fetch(`${url}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
                ...options,
            }),
        });

        if (!response.ok) {
            throw new Error("Ollama Error");
        }

        if (!response.body) {
            throw new Error("No response body.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;

                try {
                    const json = JSON.parse(line);
                    const chunk = json.message?.content;
                    if (chunk) {
                        yield chunk;
                    }

                    if (json.done) {
                        return;
                    }

                } catch (err) {

                    console.warn("Invalid stream chunk:", line);

                }
            }
        }
    }
}