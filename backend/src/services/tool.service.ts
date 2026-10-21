import {
    ToolContext,
    ToolResult,
} from "../tools/Tool";

import {
    toolRegistry,
} from "../tools/ToolRegistry";

export class ToolService {

    async execute(
        name: string,
        args: Record<string, unknown>,
        context: ToolContext
    ): Promise<ToolResult> {

        const tool =
            toolRegistry.get(name);

        if (!tool) {
            return {
                success: false,
                result: null,
                error:
                    `Tool "${name}" is not available.`,
            };
        }

        try {

            return await tool.execute(
                args,
                context
            );

        } catch (error) {

            console.error(
                `Tool execution error (${name}):`,
                error
            );

            return {
                success: false,
                result: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Tool execution failed.",
            };
        }
    }
}

export const toolService =
    new ToolService();