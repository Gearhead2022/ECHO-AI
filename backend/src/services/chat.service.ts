import { MessageRole } from "../generated/prisma/client";
import { conversationRepository, messageRepository } from "../repositories";
import { container } from "../core/container";
import { memoryDetector } from "./MemoryDetector";
import { memoryService } from "./memory.service";

export async function chatService(
    conversationId: number,
    message: string
) {
    const totalStart = performance.now();

    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    if (!message?.trim()) {
        throw new Error("Message is required");
    }

    const conversationStart = performance.now();

    const conversation =
        await conversationRepository.findById(conversationId);

    console.log(
        `⏱️ Conversation lookup: ${(
            performance.now() - conversationStart
        ).toFixed(0)}ms`
    );

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const userMessage = message.trim();

    const saveUserStart = performance.now();

    await messageRepository.create(
        conversationId,
        MessageRole.USER,
        userMessage
    );

    console.log(
        `⏱️ Save user message: ${(
            performance.now() - saveUserStart
        ).toFixed(0)}ms`
    );

    // 🧠 MEMORY
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

    const historyStart = performance.now();

    const history =
        await messageRepository.findByConversation(
            conversationId
        );

    console.log(
        `⏱️ Load history: ${(
            performance.now() - historyStart
        ).toFixed(0)}ms`
    );

    console.log("🧠 History messages:", history.length);

    console.log(
        "🧠 History roles:",
        history.map((message) => message.role)
    );

    console.log("🧠 Sending to Qwen3...");

    const llmStart = performance.now();

    const reply = await container.ai.chat(history);

    console.log(
        `🧠 Qwen3 response: ${(
            performance.now() - llmStart
        ).toFixed(0)}ms`
    );

    console.log("🔊 Sending to Piper...");

    const ttsStart = performance.now();

    const audio = await container.ai.speak(reply.text);

    console.log(
        `🔊 Piper response: ${(
            performance.now() - ttsStart
        ).toFixed(0)}ms`
    );

    const saveAssistantStart = performance.now();

    await messageRepository.create(
        conversationId,
        MessageRole.ASSISTANT,
        reply.text,
        audio
    );

    console.log(
        `⏱️ Save assistant message: ${(
            performance.now() - saveAssistantStart
        ).toFixed(0)}ms`
    );

    console.log(
        `⚡ TOTAL CHAT TIME: ${(
            performance.now() - totalStart
        ).toFixed(0)}ms`
    );

    return {
        success: true,
        text: reply.text,
        audio,
    };
}