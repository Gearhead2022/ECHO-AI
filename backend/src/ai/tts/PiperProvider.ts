import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import { ITTSProvider } from "./interfaces/ITTSProvider";

function formatPathsForSpeech(text: string): string {
    return text.replace(
        /\b([A-Za-z]):\\([^"'<>|?*\r\n]*)/g,
        (match, drive: string, remainder: string) => {
            // Remove sentence-ending punctuation accidentally captured by the path.
            const trailingPunctuation = remainder.match(/[.,;:!?]+$/)?.[0] ?? "";
            const cleanPath = trailingPunctuation
                ? remainder.slice(0, -trailingPunctuation.length)
                : remainder;

            const parts = cleanPath
                .split("\\")
                .filter(Boolean);

            const spokenParts = parts.map((part: string, index: number) => {
                // Speak common file extensions more clearly.
                const extensionMatch = part.match(/^(.*)\.([a-zA-Z0-9]+)$/);

                if (extensionMatch) {
                    const [, filename, extension] = extensionMatch;

                    const spokenExtension: Record<string, string> = {
                        md: "M D",
                        ts: "T S",
                        tsx: "T S X",
                        js: "J S",
                        jsx: "J S X",
                        json: "JSON",
                        pdf: "P D F",
                        txt: "T X T",
                        html: "H T M L",
                        css: "C S S",
                        docx: "docx",
                        doc: "doc",
                        xlsx: "Excel file",
                        xls: "Excel file",
                        pptx: "PowerPoint file",
                        ppt: "PowerPoint file",
                    };

                    const suffix =
                        spokenExtension[extension.toLowerCase()] ??
                        extension.split("").join(" ");

                    return `${filename} dot ${suffix}`;
                }

                return index === parts.length - 1
                    ? part
                    : `${part} folder`;
            });

            return `${drive} drive, ${spokenParts.join(", ")}${trailingPunctuation}`;
        }
    );
}


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
            const speechText = formatPathsForSpeech(text
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
                .replace(/\s{2,}/g, " "))

                .trim();

            console.log("[TTS] Original text:", JSON.stringify(text));
            console.log("[TTS] Speech text:", JSON.stringify(speechText));

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