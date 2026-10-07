import { memoryDetector } from "./services/MemoryDetector";

const tests = [
    "Remember that my favorite language is TypeScript.",
    "Remember my name is John.",
    "Please remember that I use VS Code.",
    "Don't forget that my project is Echo AI.",
    "I am going to eat pizza later.",
];

for (const message of tests) {

    const result =
        memoryDetector.detect(message);

    console.log("\nMessage:", message);
    console.log("Memory:", result);
}