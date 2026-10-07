import { memoryRepository } from "../repositories/MemoryRepository";

export class MemoryService {

    async getMemories() {
        return memoryRepository.getAll();
    }

    async getMemory(key: string) {
        return memoryRepository.getByKey(key);
    }

    async remember(
        key: string,
        value: string,
        category?: string
    ) {
        return memoryRepository.save(
            key,
            value,
            category
        );
    }

    async forget(key: string) {
        return memoryRepository.delete(key);
    }

    async buildMemoryContext(): Promise<string> {
        const memories =
            await memoryRepository.getAll();

        if (memories.length === 0) {
            return "";
        }

        return memories
            .map(
                (memory) =>
                    `- ${memory.key}: ${memory.value}`
            )
            .join("\n");
    }
}

export const memoryService =
    new MemoryService();