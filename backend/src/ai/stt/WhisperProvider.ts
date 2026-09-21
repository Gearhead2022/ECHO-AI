import { spawn } from "child_process";
import path from "path";
import { ISTTProvider } from "./interfaces/ISTTProvider";

export class WhisperProvider implements ISTTProvider {

    private readonly whisperExe =
        "D:\\Echo AI\\AI\\whisper\\whisper.cpp\\build\\bin\\Release\\whisper-cli.exe";

    private readonly model =
        "D:\\Echo AI\\AI\\whisper\\whisper.cpp\\ggml-base.en.bin";

    async transcribe(
        audioPath: string
    ): Promise<{ text: string }> {

        return new Promise((resolve, reject) => {

            const args = [
                "-m",
                this.model,
                "-f",
                path.resolve(audioPath),
                "--no-timestamps",
            ];

            const whisper = spawn(
                this.whisperExe,
                args,
                {
                    windowsHide: true,
                }
            );

            let stdout = "";
            let stderr = "";

            whisper.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            whisper.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            whisper.on("error", (error) => {
                reject(error);
            });

            whisper.on("close", (code) => {

                if (code !== 0) {
                    reject(
                        new Error(
                            `Whisper exited with code ${code}\n${stderr}`
                        )
                    );

                    return;
                }

                const text = stdout.trim();

                resolve({
                    text,
                });
            });
        });
    }
}