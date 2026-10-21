export interface DetectedMemory {
    key: string;
    value: string;
    category?: string;
}

export interface DetectedForget {
    key: string;
}

export class MemoryDetector {

    detect(message: string): DetectedMemory | null {

        const text = message.trim();

        if (!text) {
            return null;
        }

        const patterns = [
            // Explicit memory requests
            /^(?:please\s+)?remember that (.+?) is (.+)$/i,
            /^(?:please\s+)?remember (.+?) is (.+)$/i,
            /^(?:please\s+)?don't forget that (.+?) is (.+)$/i,
            /^(?:please\s+)?don't forget (.+?) is (.+)$/i,
            /^(?:please\s+)?dont forget that (.+?) is (.+)$/i,
            /^(?:please\s+)?dont forget (.+?) is (.+)$/i,

            // Natural memory updates and corrections
            /^(?:please\s+)?(?:my\s+)?(.+?) is now (.+)$/i,
            /^(?:please\s+)?(?:my\s+)?(.+?) is (.+?) now$/i,
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
            /^(?:please\s+)?remember that I (?:use|uses) (.+)$/i,
            /^(?:please\s+)?remember I (?:use|uses) (.+)$/i,
            /^(?:please\s+)?remember that I work with (.+)$/i,
            /^(?:please\s+)?remember I work with (.+)$/i,
            /^(?:please\s+)?remember that I'm building (.+)$/i,
            /^(?:please\s+)?remember that I am building (.+)$/i,
            /^(?:please\s+)?remember I'm building (.+)$/i,
            /^(?:please\s+)?remember I am building (.+)$/i,
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

            const normalizedText = text.toLowerCase();

            if (normalizedText.includes("building")) {
                return {
                    key: "current_project",
                    value,
                    category: "technical",
                };
            }

            if (normalizedText.includes("work with")) {
                return {
                    key: "works_with",
                    value,
                    category: "technical",
                };
            }

            return {
                key: "uses",
                value,
                category: "technical",
            };
        }

        return null;
    }


    detectForget(message: string): DetectedForget | null {
        const text = message.trim();

        if (!text) {
            return null;
        }

        const patterns = [
            /^(?:please\s+)?forget my (.+)$/i,
            /^(?:please\s+)?forget (?:that )?my (.+)$/i,
            /^(?:please\s+)?delete my (.+)$/i,
            /^(?:please\s+)?remove my (.+)$/i,
            /^(?:please\s+)?forget about my (.+)$/i,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);

            if (!match) {
                continue;
            }

            const rawKey = match[1]
                .trim()
                .replace(/[.!?]+$/, "");

            if (!rawKey) {
                return null;
            }

            return {
                key: this.normalizeKey(rawKey),
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