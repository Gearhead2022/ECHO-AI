
import { readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { Tool, ToolContext, ToolResult } from "./Tool";

const MAX_RESULTS = 50;
const MAX_ENTRIES_SCANNED = 10_000;
const MAX_DEPTH = 12;

const SKIPPED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
]);

export const searchFilesTool: Tool = {
    name: "search_files",

    description:
        "Search for filenames inside Echo's approved project folder. " +
        "Optionally filter by file extension. This tool only lists files; " +
        "it does not read, modify, move, or delete them.",

    parameters: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description:
                    "Text to find in a filename, such as README or AIService.",
            },
            extension: {
                type: "string",
                description:
                    "Optional file extension filter, such as .ts or .md.",
            },
        },
        required: ["query"],
        additionalProperties: false,
    },

    async execute(
        args: Record<string, unknown>,
        _context: ToolContext
    ): Promise<ToolResult> {
        const query =
            typeof args.query === "string"
                ? args.query.trim().toLowerCase()
                : "";

        const extensionInput =
            typeof args.extension === "string"
                ? args.extension.trim().toLowerCase()
                : "";

        if (!query || query.length > 200) {
            return {
                success: false,
                result: null,
                error: "Please provide a filename search query of 1–200 characters.",
            };
        }

        if (
            extensionInput &&
            !/^\.[a-z0-9_-]{1,20}$/.test(
                extensionInput.startsWith(".")
                    ? extensionInput
                    : `.${extensionInput}`
            )
        ) {
            return {
                success: false,
                result: null,
                error: "Invalid extension. Use a value such as .ts or .md.",
            };
        }

        const extension = extensionInput
            ? extensionInput.startsWith(".")
                ? extensionInput
                : `.${extensionInput}`
            : "";

        const configuredRoot = process.env.ECHO_ALLOWED_ROOT?.trim();

        if (!configuredRoot) {
            return {
                success: false,
                result: null,
                error: "ECHO_ALLOWED_ROOT is not configured in the backend.",
            };
        }

        try {
            const root = await realpath(configuredRoot);
            const rootStats = await stat(root);

            if (!rootStats.isDirectory()) {
                return {
                    success: false,
                    result: null,
                    error: "The approved path is not a directory.",
                };
            }

            const files: Array<{
                name: string;
                path: string;
            }> = [];

            const pending: Array<{
                directory: string;
                depth: number;
            }> = [{ directory: root, depth: 0 }];

            let scanned = 0;

            while (
                pending.length > 0 &&
                scanned < MAX_ENTRIES_SCANNED &&
                files.length < MAX_RESULTS
            ) {
                const current = pending.pop()!;

                let entries;

                try {
                    entries = await readdir(current.directory, {
                        withFileTypes: true,
                    });
                } catch {
                    // Skip folders Echo cannot access.
                    continue;
                }

                for (const entry of entries) {
                    scanned++;

                    if (scanned >= MAX_ENTRIES_SCANNED) {
                        break;
                    }

                    // Never follow symbolic links.
                    if (entry.isSymbolicLink()) {
                        continue;
                    }

                    const fullPath = path.join(
                        current.directory,
                        entry.name
                    );

                    if (entry.isDirectory()) {
                        if (
                            current.depth < MAX_DEPTH &&
                            !SKIPPED_DIRECTORIES.has(entry.name.toLowerCase())
                        ) {
                            pending.push({
                                directory: fullPath,
                                depth: current.depth + 1,
                            });
                        }

                        continue;
                    }

                    if (!entry.isFile()) {
                        continue;
                    }

                    const name = entry.name.toLowerCase();

                    if (!name.includes(query)) {
                        continue;
                    }

                    if (
                        extension &&
                        path.extname(name) !== extension
                    ) {
                        continue;
                    }

                    files.push({
                        name: entry.name,
                        path: fullPath,
                    });

                    if (files.length >= MAX_RESULTS) {
                        break;
                    }
                }
            }

            return {
                success: true,
                result: {
                    query,
                    approvedRoot: root,
                    count: files.length,
                    files,
                    scanLimitReached:
                        scanned >= MAX_ENTRIES_SCANNED,
                    resultLimitReached:
                        files.length >= MAX_RESULTS,
                },
            };
        } catch (error) {
            return {
                success: false,
                result: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "File search failed.",
            };
        }
    },
};