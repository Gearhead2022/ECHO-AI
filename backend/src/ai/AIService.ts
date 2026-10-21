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
    ) {
        const toolDefinitions =
            toolRegistry.getDefinitions();

        let currentMessages = [...messages];

        console.log("🔵 USING chatStreamWithTools()");

        for (
            let round = 0;
            round < MAX_TOOL_ROUNDS;
            round++
        ) {

            console.log("🟡 BEFORE LLM CHAT");

            const response =
                await this.llm.chat(
                    currentMessages,
                    {
                        ...options,
                        tools: toolDefinitions,
                    }
                );

            console.log("🟠 AFTER LLM CHAT");

            console.log(
                "🧪 TOOL RESPONSE:",
                JSON.stringify(response, null, 2)
            );

            // No tool call means Echo is ready
            // to give the final answer.
            if (
                !response.toolCalls ||
                response.toolCalls.length === 0
            ) {

                if (response.text) {
                    yield response.text;
                }

                return;
            }

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.text,
                toolCalls: response.toolCalls,
            };

            currentMessages.push(
                assistantMessage
            );

            const toolMessages: ChatMessage[] = [];

            for (const toolCall of response.toolCalls) {

                console.log(
                    `[Tool Round ${round + 1}]`,
                    toolCall.name,
                    toolCall.arguments
                );

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
                        success:
                            result.success,
                        result:
                            result.result,
                        error:
                            result.error,
                    }),
                    toolCallId:
                        toolCall.id,
                });
            }

            currentMessages.push(
                ...toolMessages
            );
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