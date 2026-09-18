
import { MessageRole } from "@prisma/client";
import { conversationRepository, messageRepository, } from "../repositories";
import { ChatMessage } from "../ai/llm/interfaces/ILLMProvider";
import { container } from "../core/container";


export async function chatService(
    conversationId: number,
    message: string
) {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    if (!message?.trim()) {
        throw new Error("Message is required");
    }

    // Make sure conversation exists
    const conversation =
        await conversationRepository.findById(conversationId);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // Save user's message
    await messageRepository.create(
        conversationId,
        MessageRole.USER,
        message.trim()
    );

    // Load entire conversation history
    const history =
        await messageRepository.findByConversation(
            conversationId
        );

    // Give Echo a persistent identity
    const messages = [
        {
            role: "system" as const,
            content:
                "Your name is Echo. You are a helpful voice AI assistant. " +
                "Always remember that your name is Echo.",
        },
        ...history,
    ];

    // Ask Qwen
    const reply = await container.ai.chat(messages);

    // Generate voice
    const audio = await container.ai.speak(reply.text);

    // Save Echo's response
    await messageRepository.create(
        conversationId,
        MessageRole.ASSISTANT,
        reply.text,
        audio
    );

    return {
        success: true,
        text: reply.text,
        audio,
    };
}

// export async function chatStreamController(
//     req: Request,
//     res: Response
// ) {

//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages)) {
//         return res.status(400).json({
//             success: false,
//             message: "Messages are required",
//         });
//     }

//     console.log("STREAM START");

//     res.setHeader("Content-Type", "text/plain");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     res.flushHeaders();

//     let disconnected = false;

//     req.on("close", () => {
//         disconnected = true;
//     });

//     for await (const chunk of ai.chatStream(messages)) {

//         if (disconnected) {
//             break;
//         }

//         res.write(chunk);
//     }

//     console.log("STREAM END");

//     res.end();
// }