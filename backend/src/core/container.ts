import { AIService } from "../ai/AIService";
import { ProviderFactory } from "../ai/llm/ProviderFactory";

export const container = {

    ai: new AIService(
        ProviderFactory.createLLM(),
        ProviderFactory.createTTS()
    ),

};