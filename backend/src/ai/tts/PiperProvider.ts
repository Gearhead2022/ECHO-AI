import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import { ITTSProvider } from "./interfaces/ITTSProvider";

export class PiperProvider implements ITTSProvider {

    async speak(text: string): Promise<string> {

        return new Promise((resolve, reject) => {

            const audioFolder = path.join(
                process.cwd(),
                process.env.AUDIO_OUTPUT || "public/audio"
            );

            if (!fs.existsSync(audioFolder)) {
                fs.mkdirSync(audioFolder, { recursive: true });
            }

            const outputFile = path.join(
                audioFolder,
                "response.wav"
            );

            const piper = spawn(
                process.env.PIPER_EXE!,
                [
                    "-m",
                    process.env.PIPER_MODEL!,
                    "-f",
                    outputFile
                ]
            );

            console.log("Starting Piper...");
            piper.on("error", (err) => {
                console.error("Piper process error:", err);
            });

            piper.stdin.write(text);
            piper.stdin.end();

            piper.stderr.on("data", (data) => {
                console.error(data.toString());
            });

            console.log("PIPER_EXE:", process.env.PIPER_EXE);
            console.log("PIPER_MODEL:", process.env.PIPER_MODEL);
            console.log("AUDIO_OUTPUT:", process.env.AUDIO_OUTPUT);
            console.log("Output File:", outputFile);

            console.log(
                "File exists:",
                fs.existsSync(outputFile)
            );

            piper.on("close", (code) => {

                console.log("Piper exited with code:", code);

                if (code === 0) {

                    resolve("/audio/response.wav");

                } else {

                    reject(
                        new Error(
                            `Piper exited with code ${code}`
                        )
                    );

                }

            });

        });

    }

}