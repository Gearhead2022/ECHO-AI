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

            const filename = `response-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}.wav`;

            const outputFile = path.join(
                audioFolder,
                filename
            );

            // Clean text ONLY for speech.
            // The original text shown in ChatWindow remains unchanged.
            const speechText = text
                // Remove emojis
                .replace(
                    /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,
                    ""
                )

                // Remove Markdown emphasis markers
                .replace(/(\*\*|__)(.*?)\1/g, "$2")
                .replace(/(\*|_)(.*?)\1/g, "$2")

                // Remove inline code markers
                .replace(/`([^`]+)`/g, "$1")

                // Remove Markdown heading markers
                .replace(/^\s*#{1,6}\s+/gm, "")

                // Remove Markdown list markers
                .replace(/^\s*[-*+]\s+/gm, "")
                .replace(/^\s*\d+\.\s+/gm, "")

                // Remove Markdown blockquote marker
                .replace(/^\s*>\s?/gm, "")

                // Remove link formatting but keep the visible text
                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

                // Clean excessive whitespace
                .replace(/\s{2,}/g, " ")
                .trim();

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

            piper.stdin.write(speechText);
            piper.stdin.end();

            piper.stderr.on("data", (data) => {
                console.error(data.toString());
            });

            console.log("PIPER_EXE:", process.env.PIPER_EXE);
            console.log("PIPER_MODEL:", process.env.PIPER_MODEL);
            console.log("AUDIO_OUTPUT:", process.env.AUDIO_OUTPUT);
            console.log("Output File:", outputFile);

            console.log("File exists:", fs.existsSync(outputFile));

            piper.on("close", (code) => {

                console.log("Piper exited with code:", code);

                if (code === 0) {

                    resolve(`/audio/${filename}`);

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