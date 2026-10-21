import { Request, Response } from "express";
import { container } from "../core/container";
import {
    messageRepository,
    conversationRepository,
} from "../repositories";
import { MessageRole } from "../generated/prisma/client";
import { memoryDetector } from "../services/MemoryDetector";
import { memoryService } from "../services/memory.service";

export async function chatStreamController(
    req: Request,
    res: Response
) {
    try {
        const {
            conversationId,
            message,
        } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const id = Number(conversationId);
        const userMessage = message.trim();

        const conversation =
            await conversationRepository.findById(id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Save user message
        await messageRepository.create(
            id,
            MessageRole.USER,
            userMessage
        );


        // 🧠 Detect requests to forget a memory first
        const detectedForget =
            memoryDetector.detectForget(userMessage);

        if (detectedForget) {
            const deletedMemory =
                await memoryService.forget(detectedForget.key);

            console.log(
                deletedMemory
                    ? "🗑️ Memory deleted:"
                    : "⚠️ Memory not found:",
                detectedForget.key
            );
        } else {
            // 🧠 Detect requests to save or update a memory
            const detectedMemory =
                memoryDetector.detect(userMessage);

            if (detectedMemory) {
                await memoryService.remember(
                    detectedMemory.key,
                    detectedMemory.value,
                    detectedMemory.category
                );

                console.log(
                    "🧠 Memory saved:",
                    detectedMemory
                );
            }
        }

        // Load conversation history
        const history =
            await messageRepository.findByConversation(id);

        const recentHistory =
            history.slice(-10);

        // const history = [
        //     {
        //         role: "user" as const,
        //         content: userMessage,
        //     },
        // ];

        // Configure streaming response
        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.flushHeaders();

        let fullResponse = "";

        // Stream Qwen response
        for await (
            const chunk
            of container.ai.chatStreamWithTools(
                recentHistory,
                id,
                userMessage
            )
        ) {
            fullResponse += chunk;
            res.write(chunk);
        }

        // Save complete assistant response
        await messageRepository.create(
            id,
            MessageRole.ASSISTANT,
            fullResponse
        );

        res.end();


    } catch (error) {
        console.error("Chat stream error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }

        // Tell the frontend that streaming failed after it began.
        if (!res.destroyed && !res.writableEnded) {
            res.write("\n__ECHO_STREAM_ERROR__");
            res.end();
        }
    }
}