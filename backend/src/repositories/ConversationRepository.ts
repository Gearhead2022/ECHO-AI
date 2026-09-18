import { prisma } from "../config/prismaClient";

export class ConversationRepository {
    async create(title = "New Chat") {
        return prisma.conversation.create({
            data: {
                title,
            },
        });
    }

    async findById(id: number) {
        return prisma.conversation.findUnique({

            where: {
                id,
            },

            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
    }

    async getAll() {
        return prisma.conversation.findMany({
            orderBy: {
                updatedAt: "desc",
            },
        });
    }
}