export interface DetectedMemory {
    key: string;
    value: string;
    category?: string;
}

export class MemoryDetector {

    detect(message: string): DetectedMemory | null {

        const text = message.trim();

        if (!text) {
            return null;
        }

        const patterns = [
            /^remember that (.+?) is (.+)$/i,
            /^remember (.+?) is (.+)$/i,
            /^please remember that (.+?) is (.+)$/i,
            /^please remember (.+?) is (.+)$/i,
            /^don't forget that (.+?) is (.+)$/i,
            /^dont forget that (.+?) is (.+)$/i,
        ];

        for (const pattern of patterns) {

            const match = text.match(pattern);

            if (!match) {
                continue;
            }

            const rawKey = match[1].trim();

            const value = this.cleanValue(
                match[2].trim()
            );

            if (!rawKey || !value) {
                return null;
            }

            return {
                key: this.normalizeKey(rawKey),
                value,
                category: this.detectCategory(rawKey),
            };
        }

        const usePatterns = [
            /^remember that I (?:use|uses) (.+)$/i,
            /^remember I (?:use|uses) (.+)$/i,
            /^please remember that I (?:use|uses) (.+)$/i,
            /^please remember I (?:use|uses) (.+)$/i,
        ];

        for (const pattern of usePatterns) {

            const match = text.match(pattern);

            if (!match) {
                continue;
            }

            const value = this.cleanValue(
                match[1].trim()
            );

            if (!value) {
                return null;
            }

            return {
                key: "uses",
                value,
                category: "technical",
            };
        }

        return null;
    }

    private cleanValue(value: string): string {

        return value
            .replace(/[.!?]+$/, "")
            .trim();
    }

    private normalizeKey(value: string): string {

        return value
            .toLowerCase()
            .replace(/^my\s+/, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
    }

    private detectCategory(key: string): string {

        const normalized = key.toLowerCase();

        if (
            normalized.includes("favorite") ||
            normalized.includes("prefer") ||
            normalized.includes("like")
        ) {
            return "preference";
        }

        if (
            normalized.includes("name") ||
            normalized.includes("age")
        ) {
            return "personal";
        }

        if (
            normalized.includes("project") ||
            normalized.includes("language") ||
            normalized.includes("framework") ||
            normalized.includes("editor")
        ) {
            return "technical";
        }

        return "general";
    }
}

export const memoryDetector =
    new MemoryDetector();