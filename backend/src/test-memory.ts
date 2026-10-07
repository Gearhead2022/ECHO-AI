import "dotenv/config";

import { memoryService } from "./services/memory.service";

async function main() {
    const memory = await memoryService.remember(
        "favorite_language",
        "TypeScript",
        "preference"
    );

    console.log("🧠 Memory saved:");
    console.log(memory);

    const context =
        await memoryService.buildMemoryContext();

    console.log("\n🧠 Memory context:");
    console.log(context);
}

main()
    .catch((error) => {
        console.error("❌ Memory test failed:", error);
        process.exit(1);
    });