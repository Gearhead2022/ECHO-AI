import { spawn } from "child_process";
import path from "path";

export class AudioConverter {

    private readonly ffmpeg =
        "C:\\Users\\clyde\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe";

    async toWav(
        inputPath: string,
        outputPath: string
    ): Promise<void> {

        return new Promise((resolve, reject) => {

            const args = [
                "-y",
                "-i",
                path.resolve(inputPath),
                "-ar",
                "16000",
                "-ac",
                "1",
                "-c:a",
                "pcm_s16le",
                path.resolve(outputPath),
            ];

            const ffmpeg = spawn(
                this.ffmpeg,
                args,
                {
                    windowsHide: true,
                }
            );

            let stderr = "";

            ffmpeg.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            ffmpeg.on("error", (error) => {
                reject(error);
            });

            ffmpeg.on("close", (code) => {

                if (code !== 0) {
                    reject(
                        new Error(
                            `FFmpeg exited with code ${code}\n${stderr}`
                        )
                    );

                    return;
                }

                resolve();
            });
        });
    }
}