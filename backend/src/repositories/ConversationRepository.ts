import { prisma } from "../lib/prisma";

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

    async updateTitle(id: number, title: string) {
        return prisma.conversation.update({
            where: {
                id,
            },
            data: {
                title,
            },
        });
    }

    async delete(id: number) {
        return prisma.conversation.delete({
            where: {
                id,
            },
        });
    }
}