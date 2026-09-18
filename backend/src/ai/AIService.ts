import { ILLMProvider, ChatMessage, ChatOptions } from "./llm/interfaces/ILLMProvider";
import { ITTSProvider } from "./tts/interfaces/ITTSProvider";

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

    // async *chatStream(
    //     messages: ChatMessage[],
    //     options?: ChatOptions
    // ) {
    //     for await (const chunk of this.llm.chatStream(messages, options)) {
    //         yield chunk;
    //     }
    // }

    async speak(text: string) {

        return this.tts.speak(text);

    }

}