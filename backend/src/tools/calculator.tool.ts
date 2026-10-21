import {
    Tool,
    ToolContext,
    ToolResult,
} from "./Tool";

import { evaluate } from "mathjs";

export const calculatorTool: Tool = {

    name: "calculator",

    description:
        "Evaluates mathematical expressions. Preserve the exact sequence of operations requested by the user. For sequential instructions such as '125 + 75, then multiply the result by 4', include parentheses to produce '(125 + 75) * 4', not '125 + 75 * 4'.",

    parameters: {
        type: "object",
        properties: {
            expression: {
                type: "string",
                description:
                    "A mathematical expression to calculate.",
            },
        },
        required: ["expression"],
    },

    async execute(
        args: Record<string, unknown>,
        _context: ToolContext
    ): Promise<ToolResult> {

        const expression =
            args.expression;

        if (
            typeof expression !== "string" ||
            !expression.trim()
        ) {
            return {
                success: false,
                result: null,
                error:
                    "A mathematical expression is required.",
            };
        }

        try {

            const result =
                evaluate(expression);

            if (
                typeof result === "number" &&
                !Number.isFinite(result)
            ) {
                return {
                    success: false,
                    result: null,
                    error:
                        "The calculation produced a non-finite result.",
                };
            }

            return {
                success: true,
                result,
            };

        } catch (error) {

            console.error(
                "Calculator error:",
                error
            );

            return {
                success: false,
                result: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to calculate expression.",
            };
        }
    },
};