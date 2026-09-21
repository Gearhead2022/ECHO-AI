import { AudioConverter } from "./ai/stt/AudioConverter";

async function testFFmpeg() {

    try {

        const converter = new AudioConverter();

        const input =
            "D:\\Echo AI\\AI\\whisper\\whisper.cpp\\samples\\jfk.wav";

        const output =
            "D:\\Echo AI\\AI\\whisper\\whisper.cpp\\samples\\jfk-ts-converted.wav";

        await converter.toWav(input, output);

        console.log("✅ FFmpeg conversion successful!");
        console.log("Output:", output);

    } catch (error) {

        console.error("❌ FFmpeg test failed:");
        console.error(error);
    }
}

testFFmpeg();