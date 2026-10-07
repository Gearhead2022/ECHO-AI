import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ProviderFactory } from "../ai/llm/ProviderFactory";
import { AudioConverter } from "../ai/stt/AudioConverter";
import { container } from "../core/container";

const router = Router();

const uploadDir = path.join(
    process.cwd(),
    "temp",
    "voice"
);

fs.mkdirSync(uploadDir, {
    recursive: true,
});

const upload = multer({
    dest: uploadDir,
});

const stt = ProviderFactory.createSTT();
const converter = new AudioConverter();

router.get("/test", (_, res) => {
    console.log("✅ Voice test endpoint reached");

    res.json({
        success: true,
        message: "Voice route is reachable",
    });
});

router.post("/test-post", (req, res) => {

    console.log("✅ POST test endpoint reached");

    console.log("Content-Type:", req.headers["content-type"]);

    res.json({
        success: true,
        message: "POST route is reachable",
    });
});

router.post(
    "/transcribe",
    upload.single("audio"),
    async (req, res) => {

        let inputPath: string | undefined;
        let wavPath: string | undefined;

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No audio file received",
                });
            }

            inputPath = req.file.path;

            wavPath = path.join(
                uploadDir,
                `${req.file.filename}.wav`
            );

            console.log("🎤 Audio received:");
            console.log("Input:", inputPath);

            await converter.toWav(
                inputPath,
                wavPath
            );

            console.log("🔄 Audio converted:");
            console.log("WAV:", wavPath);

            const result =
                await stt.transcribe(wavPath);

            console.log("📝 Transcription:");
            console.log(result.text);

            return res.json({
                success: true,
                text: result.text,
            });

        } catch (error) {

            console.error(
                "❌ Voice transcription failed:",
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Transcription failed",
            });

        } finally {

            if (inputPath) {
                fs.rm(
                    inputPath,
                    {
                        force: true,
                    },
                    () => { }
                );
            }

            if (wavPath) {
                fs.rm(
                    wavPath,
                    {
                        force: true,
                    },
                    () => { }
                );
            }
        }
    }
);

router.post("/speak", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({
                success: false,
                error: "Text is required",
            });
        }

        const speechText = text
            .trim()
            .replace(
                /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,
                ""
            )
            .replace(/\s{2,}/g, " ")
            .trim();

        if (!speechText) {
            console.log(
                "🔇 Skipping non-speakable TTS request:",
                text
            );

            return res.json({
                success: true,
                audio: null,
                skipped: true,
            });
        }

        console.log(
            "🔊 TTS request:",
            speechText
        );

        const audio = await container.ai.speak(
            speechText
        );

        console.log("🔊 TTS generated URL:", audio);

        // Convert /audio/filename.wav into the actual filesystem path
        const filename = path.basename(audio);

        const audioFilePath = path.join(
            process.cwd(),
            "public",
            "audio",
            filename
        );

        console.log("📁 TTS file path:", audioFilePath);
        console.log(
            "📦 TTS file exists:",
            fs.existsSync(audioFilePath)
        );

        if (fs.existsSync(audioFilePath)) {
            const stats = fs.statSync(audioFilePath);

            console.log(
                "📏 TTS file size:",
                stats.size,
                "bytes"
            );

            console.log(
                "🕒 TTS file created:",
                stats.birthtime
            );
        } else {
            console.error(
                "❌ TTS WAV DOES NOT EXIST:",
                audioFilePath
            );
        }

        return res.json({
            success: true,
            audio,
        });

    } catch (error) {
        console.error(
            "❌ TTS failed:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Speech generation failed",
        });
    }
});

export default router;