import { Request, Response } from "express";
import { memoryService } from "../services/memory.service";

export async function getMemories(
    _req: Request,
    res: Response
) {
    try {
        const memories =
            await memoryService.getMemories();

        return res.json({
            success: true,
            memories,
        });

    } catch (error) {

        console.error(
            "Get memories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function deleteMemory(
    req: Request,
    res: Response
) {
    try {
        const key = String(req.params.key);

        if (!key) {
            return res.status(400).json({
                success: false,
                message: "Memory key is required",
            });
        }

        const memory = await memoryService.forget(key);

        if (!memory) {
            return res.status(404).json({
                success: false,
                message: "Memory not found",
            });
        }

        return res.json({
            success: true,
        });

    } catch (error) {

        console.error(
            "Delete memory error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function updateMemory(
    req: Request,
    res: Response
) {
    try {
        const key = String(req.params.key);

        const {
            value,
            category,
        } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: "Memory key is required",
            });
        }

        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Memory value is required",
            });
        }

        const existing =
            await memoryService.getMemory(key);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Memory not found",
            });
        }

        const memory =
            await memoryService.remember(
                key,
                value.trim(),
                category
            );

        return res.json({
            success: true,
            memory,
        });

    } catch (error) {

        console.error(
            "Update memory error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}