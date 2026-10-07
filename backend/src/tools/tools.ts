export interface ToolContext {
    conversationId: number;
    userMessage: string;
}

export interface ToolResult {
    success: boolean;
    result: unknown;
    error?: string;
}

export interface Tool {
    name: string;
    description: string;

    execute(
        args: Record<string, unknown>,
        context: ToolContext
    ): Promise<ToolResult>;
}