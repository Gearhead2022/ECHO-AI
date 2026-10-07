import { prisma } from "../lib/prisma";

export class MemoryRepository {

    async getAll() {
        return prisma.memory.findMany({
            orderBy: {
                updatedAt: "desc",
            },
        });
    }

    async getByKey(key: string) {
        return prisma.memory.findFirst({
            where: {
                key,
            },
        });
    }

    async save(
        key: string,
        value: string,
        category?: string
    ) {
        const existing =
            await prisma.memory.findFirst({
                where: {
                    key,
                },
            });

        if (existing) {
            return prisma.memory.update({
                where: {
                    id: existing.id,
                },
                data: {
                    value,
                    category,
                },
            });
        }

        return prisma.memory.create({
            data: {
                key,
                value,
                category,
            },
        });
    }

    async delete(key: string) {
        const existing =
            await prisma.memory.findFirst({
                where: {
                    key,
                },
            });

        if (!existing) {
            return null;
        }

        return prisma.memory.delete({
            where: {
                id: existing.id,
            },
        });
    }
}

export const memoryRepository =
    new MemoryRepository();