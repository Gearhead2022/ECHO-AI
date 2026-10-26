
import {
    lstat,
    readFile,
    realpath,
    stat,
} from "node:fs/promises";
import path from "node:path";

import {
    Tool,
    ToolContext,
    ToolResult,
} from "./Tool";

const MAX_FILE_BYTES = 64 * 1024;

const ALLOWED_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".txt",
    ".css",
    ".scss",
    ".html",
    ".xml",
    ".yaml",
    ".yml",
    ".toml",
    ".sql",
    ".py",
    ".sh",
    ".ps1",
]);

const SENSITIVE_NAMES = new Set([
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    "id_rsa",
    "id_ed25519",
    "credentials",
    "secrets.json",
]);

export const readFileTool: Tool = {
    name: "read_file",

    description:
        "Reads the contents of a supported text file inside Echo's approved project folder. " +
        "Use a path returned by search_files whenever possible. " +
        "This tool is read-only and cannot modify or execute files. " +
        "Do not use it to read environment files, credentials, private keys, or other secret files.",

    parameters: {
        type: "object",
        properties: {
            path: {
                type: "string",
                description:
                    "The file path returned by search_files, or a path relative to ECHO's approved project folder.",
            },
        },
        required: ["path"],
        additionalProperties: false,
    },

    async execute(
        args: Record<string, unknown>,
        _context: ToolContext
    ): Promise<ToolResult> {
        const requestedPath =
            typeof args.path === "string"
                ? args.path.trim()
                : "";

        if (
            !requestedPath ||
            requestedPath.length > 1000
        ) {
            return {
                success: false,
                result: null,
                error: "Please provide a valid file path.",
            };
        }

        const configuredRoot =
            process.env.ECHO_ALLOWED_ROOT?.trim();

        if (!configuredRoot) {
            return {
                success: false,
                result: null,
                error:
                    "ECHO_ALLOWED_ROOT is not configured in the backend.",
            };
        }

        try {
            const root = await realpath(configuredRoot);
            const rootStats = await stat(root);

            if (!rootStats.isDirectory()) {
                return {
                    success: false,
                    result: null,
                    error:
                        "The approved path is not a directory.",
                };
            }

            // Absolute paths are accepted only if they remain
            // inside the approved root. Relative paths are rooted there.
            const candidate = path.isAbsolute(requestedPath)
                ? path.resolve(requestedPath)
                : path.resolve(root, requestedPath);

            const relativePath = path.relative(root, candidate);

            if (
                !relativePath ||
                relativePath === "." ||
                relativePath === ".." ||
                relativePath.startsWith(`..${path.sep}`) ||
                path.isAbsolute(relativePath)
            ) {
                return {
                    success: false,
                    result: null,
                    error:
                        "Access denied. The file must be inside the approved project folder.",
                };
            }

            // Do not read a symbolic link as the requested file.
            const linkStats = await lstat(candidate);

            if (linkStats.isSymbolicLink()) {
                return {
                    success: false,
                    result: null,
                    error:
                        "Symbolic links cannot be read by this tool.",
                };
            }

            const resolvedFile = await realpath(candidate);
            const resolvedRelative = path.relative(
                root,
                resolvedFile
            );

            // Check the resolved target too, not just the supplied path.
            if (
                !resolvedRelative ||
                resolvedRelative === ".." ||
                resolvedRelative.startsWith(`..${path.sep}`) ||
                path.isAbsolute(resolvedRelative)
            ) {
                return {
                    success: false,
                    result: null,
                    error:
                        "Access denied. The resolved file is outside the approved project folder.",
                };
            }

            const fileStats = await stat(resolvedFile);

            if (!fileStats.isFile()) {
                return {
                    success: false,
                    result: null,
                    error: "The requested path is not a regular file.",
                };
            }

            const fileName = path.basename(resolvedFile);
            const lowerName = fileName.toLowerCase();
            const extension = path.extname(lowerName);

            if (
                SENSITIVE_NAMES.has(lowerName) ||
                lowerName.startsWith(".env.") ||
                lowerName.endsWith(".pem") ||
                lowerName.endsWith(".key") ||
                lowerName.endsWith(".pfx") ||
                lowerName.endsWith(".p12")
            ) {
                return {
                    success: false,
                    result: null,
                    error:
                        "Access denied. This filename may contain secrets or private credentials.",
                };
            }

            if (!ALLOWED_EXTENSIONS.has(extension)) {
                return {
                    success: false,
                    result: null,
                    error:
                        `Unsupported file type '${extension || "(no extension)"}'. ` +
                        "Only approved text file types can be read.",
                };
            }

            if (fileStats.size > MAX_FILE_BYTES) {
                return {
                    success: false,
                    result: null,
                    error:
                        "The file exceeds the 64 KB read limit. " +
                        "Use a smaller file or add bounded range reading later.",
                };
            }

            const content = await readFile(
                resolvedFile,
                "utf8"
            );

            return {
                success: true,
                result: {
                    name: fileName,
                    path: resolvedFile,
                    sizeBytes: fileStats.size,
                    content,
                },
            };
        } catch (error) {
            console.error("Read file error:", error);

            return {
                success: false,
                result: null,
                error:
                    error instanceof Error &&
                        "code" in error &&
                        error.code === "ENOENT"
                        ? "The requested file does not exist."
                        : "Unable to read the requested file. Check its path and permissions.",
            };
        }
    },
};
