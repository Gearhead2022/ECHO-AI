import { ILLMProvider } from "./interfaces/ILLMProvider";
import { OllamaProvider } from "./OllamaProvider";
import { PiperProvider } from "../tts/PiperProvider";

export class ProviderFactory {

    static createLLM(): ILLMProvider {

        const provider =
            process.env.LLM_PROVIDER ?? "ollama";

        switch (provider) {

            case "ollama":
                return new OllamaProvider();

            default:
                throw new Error(
                    `Unknown provider: ${provider}`
                );
        }

    }
    static createTTS() {

        return new PiperProvider();

    }

}