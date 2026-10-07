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

        // 🧠 Detect explicit memory request
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

        // Load conversation history
        const history =
            await messageRepository.findByConversation(id);

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
            const chunk of container.ai.chatStream(history)
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

        console.error(
            "Chat stream error:",
            error
        );

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }

        res.end();
    }
}