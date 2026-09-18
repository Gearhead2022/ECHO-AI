import { MessageRole } from "@prisma/client";
import { prisma } from "../config/prismaClient";
import { ChatMessage } from "../ai/llm/interfaces/ILLMProvider";

export class MessageRepository {

    async create(
        conversationId: number,
        role: MessageRole,
        content: string,
        audioUrl?: string
    ) {

        return prisma.message.create({

            data: {
                conversationId,
                role,
                content,
                audioUrl,
            },
        });
    }

    async findByConversation(
        conversationId: number
    ): Promise<ChatMessage[]> {

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return messages.map((message) => ({
            role:
                message.role === MessageRole.USER
                    ? "user"
                    : "assistant",

            content: message.content,
        }));
    }
}