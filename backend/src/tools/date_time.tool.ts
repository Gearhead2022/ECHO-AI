
import {
    Tool,
    ToolContext,
    ToolResult,
} from "./Tool";

export const dateTimeTool: Tool = {
    name: "date_time",

    description:
        "Gets the current date, time, and day of the week, or calculates a date a specified number of days before or after today. Use this tool whenever the user asks for the current date or time, today's day, or a relative date calculation. The system uses the server's local timezone.",

    parameters: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: [
                    "current_datetime",
                    "date_after_days",
                ],
                description:
                    "Use current_datetime for the current date and time. Use date_after_days to calculate a date relative to today.",
            },
            days: {
                type: "number",
                description:
                    "Number of days before or after today. Negative values mean past dates. Required for date_after_days.",
            },
        },
        required: ["action"],
    },

    async execute(
        args: Record<string, unknown>,
        _context: ToolContext
    ): Promise<ToolResult> {
        try {
            const action = args.action;

            if (action === "current_datetime") {
                const now = new Date();

                return {
                    success: true,
                    result: {
                        iso: now.toISOString(),
                        date: now.toLocaleDateString(),
                        time: now.toLocaleTimeString(),
                        dayOfWeek: now.toLocaleDateString(
                            undefined,
                            { weekday: "long" }
                        ),
                        timezone:
                            Intl.DateTimeFormat()
                                .resolvedOptions()
                                .timeZone,
                    },
                };
            }

            if (action === "date_after_days") {
                const days = args.days;

                if (
                    typeof days !== "number" ||
                    !Number.isSafeInteger(days) ||
                    Math.abs(days) > 365000
                ) {
                    return {
                        success: false,
                        result: null,
                        error:
                            "A whole number of days within the supported range is required.",
                    };
                }

                const date = new Date();
                date.setDate(date.getDate() + days);

                return {
                    success: true,
                    result: {
                        daysFromToday: days,
                        date: date.toLocaleDateString(),
                        dayOfWeek: date.toLocaleDateString(
                            undefined,
                            { weekday: "long" }
                        ),
                    },
                };
            }

            return {
                success: false,
                result: null,
                error: "Unsupported date/time action.",
            };
        } catch (error) {
            console.error("Date/time tool error:", error);

            return {
                success: false,
                result: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to retrieve date/time information.",
            };
        }
    },
};
