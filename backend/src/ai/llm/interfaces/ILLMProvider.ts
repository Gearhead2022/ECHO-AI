export type ChatRole =
    | "system"
    | "user"
    | "assistant"
    | "tool";

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ChatStreamEvent {
    type:
    | "text"
    | "tool_call"
    | "done";

    text?: string;

    toolCall?: ToolCall;
}

export interface ChatMessage {
    role: ChatRole;
    content: string;
    toolCallId?: string;
    toolCalls?: ToolCall[];
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}

export interface ChatResponse {
    text: string;
    toolCalls?: ToolCall[];
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    tools?: ToolDefinition[];
}

export interface ILLMProvider {

    chat(
        messages: ChatMessage[],
        options?: ChatOptions
    ): Promise<ChatResponse>;

    chatStream(
        messages: ChatMessage[],
        options?: ChatOptions
    ): AsyncGenerator<ChatStreamEvent>;

}