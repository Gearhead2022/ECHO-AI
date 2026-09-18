
export async function chat(message: string) {
    const OLLAMA_URL = process.env.OLLAMA_URL;
    const MODEL = process.env.OLLAMA_MODEL;

    if (!OLLAMA_URL) {
        throw new Error("OLLAMA_URL is missing");
    }

    if (!MODEL) {
        throw new Error("OLLAMA_MODEL is missing");
    }

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: "user",
                    content: message,
                },
            ],
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to communicate with Ollama");
    }

    return response.json();
}