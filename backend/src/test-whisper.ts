import { ProviderFactory } from "./ai/llm/ProviderFactory";

async function testWhisper() {
    try {
        const whisper = ProviderFactory.createSTT();

        const result = await whisper.transcribe(
            "D:\\Echo AI\\AI\\whisper\\whisper.cpp\\samples\\jfk.wav"
        );

        console.log("🎤 Whisper result:");
        console.log(result.text);

    } catch (error) {
        console.error("❌ Whisper test failed:");
        console.error(error);
    }
}

testWhisper();