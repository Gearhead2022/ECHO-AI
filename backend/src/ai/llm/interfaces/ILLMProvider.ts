export type ChatRole =
    | "system"
    | "user"
    | "assistant";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatResponse {
    text: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ILLMProvider {

    chat(
        messages: ChatMessage[],
        options?: ChatOptions
    ): Promise<ChatResponse>;

    chatStream(
        messages: ChatMessage[],
        options?: ChatOptions
    ): AsyncGenerator<string>;

}