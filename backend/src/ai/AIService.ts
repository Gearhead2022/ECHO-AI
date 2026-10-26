import { ILLMProvider, ChatMessage, ChatOptions } from "./llm/interfaces/ILLMProvider";
import { ITTSProvider } from "./tts/interfaces/ITTSProvider";
import { toolService, } from "../services/tool.service";
import { toolRegistry, } from "../tools/ToolRegistry";

const MAX_TOOL_ROUNDS = 5;

export class AIService {

    constructor(
        private readonly llm: ILLMProvider,
        private readonly tts: ITTSProvider
    ) { }

    async chat(
        messages: ChatMessage[],
        options?: ChatOptions
    ) {
        return this.llm.chat(
            messages,
            options
        );
    }

    async chatWithTools(
        messages: ChatMessage[],
        conversationId: number,
        userMessage: string,
        options?: ChatOptions
    ) {
        const toolDefinitions =
            toolRegistry.getDefinitions();

        let currentMessages = [...messages];

        console.log("🟢 USING chatWithTools()");

        for (
            let round = 0;
            round < MAX_TOOL_ROUNDS;
            round++
        ) {

            const response =
                await this.llm.chat(
                    currentMessages,
                    {
                        ...options,
                        tools: toolDefinitions,
                    }
                );

            // No more tools needed.
            if (
                !response.toolCalls ||
                response.toolCalls.length === 0
            ) {
                return response;
            }

            const toolMessages: ChatMessage[] = [];

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.text,
                toolCalls: response.toolCalls,
            };

            currentMessages.push(assistantMessage);

            for (const toolCall of response.toolCalls) {

                const result =
                    await toolService.execute(
                        toolCall.name,
                        toolCall.arguments,
                        {
                            conversationId,
                            userMessage,
                        }
                    );

                toolMessages.push({
                    role: "tool",
                    content: JSON.stringify({
                        success: result.success,
                        result: result.result,
                        error: result.error,
                    }),
                    toolCallId: toolCall.id,
                });
            }

            currentMessages.push(...toolMessages);
        }

        throw new Error(
            `Maximum tool calling rounds (${MAX_TOOL_ROUNDS}) exceeded`
        );
    }


    async *chatStreamWithTools(
        messages: ChatMessage[],
        conversationId: number,
        userMessage: string,
        options?: ChatOptions
    ): AsyncGenerator<string> {
        const toolDefinitions = toolRegistry.getDefinitions();
        let currentMessages = [...messages];

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            let roundText = "";
            const toolCalls: NonNullable<ChatMessage["toolCalls"]> = [];

            for await (const event of this.llm.chatStream(
                currentMessages,
                {
                    ...options,
                    tools: toolDefinitions,
                }
            )) {
                if (event.type === "text") {
                    const chunk = event.text ?? "";

                    if (chunk) {
                        roundText += chunk;
                        yield chunk;
                    }
                }

                if (event.type === "tool_call" && event.toolCall) {
                    toolCalls.push(event.toolCall);
                }
            }

            // No tools requested: the assistant response is complete.
            if (toolCalls.length === 0) {
                return;
            }

            // Preserve the assistant's tool request in the conversation.
            currentMessages.push({
                role: "assistant",
                content: roundText,
                toolCalls,
            });

            // Execute requested tools and return their results to the model.
            const toolMessages: ChatMessage[] = [];

            for (const toolCall of toolCalls) {
                const result = await toolService.execute(
                    toolCall.name,
                    toolCall.arguments,
                    {
                        conversationId,
                        userMessage,
                    }
                );

                toolMessages.push({
                    role: "tool",
                    content: JSON.stringify({
                        success: result.success,
                        result: result.result,
                        error: result.error,
                    }),
                    toolCallId: toolCall.id,
                });
            }

            currentMessages.push(...toolMessages);
        }

        throw new Error(
            `Maximum tool calling rounds (${MAX_TOOL_ROUNDS}) exceeded`
        );
    }

    async *chatStream(
        messages: ChatMessage[],
        options?: ChatOptions
    ) {
        for await (
            const event of this.llm.chatStream(
                messages,
                options
            )
        ) {

            if (event.type === "text") {
                yield event.text ?? "";
            }

        }
    }

    async speak(text: string) {

        return this.tts.speak(text);

    }

}