import { Tool } from "./Tool";
import { calculatorTool } from "./calculator.tool";
import { searchFilesTool } from "./search_files.tool";

export class ToolRegistry {

    private tools = new Map<string, Tool>();

    register(tool: Tool): void {
        this.tools.set(
            tool.name,
            tool
        );
    }

    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    getAll(): Tool[] {
        return Array.from(
            this.tools.values()
        );
    }

    getDefinitions() {
        return this.getAll().map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        }));
    }

    has(name: string): boolean {
        return this.tools.has(name);
    }
}

export const toolRegistry =
    new ToolRegistry();

toolRegistry.register(calculatorTool);
toolRegistry.register(searchFilesTool);