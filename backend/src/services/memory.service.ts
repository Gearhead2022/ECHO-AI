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

    async buildMemoryContext(userMessage = "", limit = 10): Promise<string> {

        const memories = await memoryRepository.getAll();

        if (memories.length === 0) { return ""; }

        const messageWords = new Set(userMessage
            .toLowerCase()
            .replace(/[^a-z0-9_ ]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2));

        const scoredMemories = memories.map((memory) => {
            const searchableText = `${memory.key.replace(/_/g, " ")} 
            ${memory.value}`.toLowerCase();

            const memoryWords = searchableText
                .replace(/[^a-z0-9_ ]/g, " ")
                .split(/\s+/)
                .filter((word) => word.length > 2);

            const score = memoryWords.reduce((total, word) =>
                total + (messageWords.has(word) ? 1 : 0), 0);

            return { memory, score };
        });

        const relevantMemories = scoredMemories.filter((item) =>
            item.score > 0).sort((a, b) =>
                b.score - a.score).slice(0, limit);

        const selectedMemories = relevantMemories.length > 0 ?
            relevantMemories :
            scoredMemories.slice(0, limit);

        return selectedMemories.map(({ memory }) =>
            `- ${memory.key}:${memory.value}`).join("\n");
    }
}

export const memoryService =
    new MemoryService();