import { Request, Response } from "express";
import { conversationRepository } from "../repositories";

export async function createConversation(
    req: Request,
    res: Response
) {
    try {
        const conversation =
            await conversationRepository.create();

        return res.json({
            success: true,
            conversation,
        });

    } catch (error) {

        console.error(
            "Create conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function getConversation(
    req: Request,
    res: Response
) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        const conversation =
            await conversationRepository.findById(id);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        return res.json({
            success: true,
            conversation,
        });

    } catch (error) {

        console.error(
            "Get conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function getConversations(
    req: Request,
    res: Response
) {
    try {
        const conversations =
            await conversationRepository.getAll();

        return res.json({
            success: true,
            conversations,
        });

    } catch (error) {

        console.error(
            "Get conversations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function updateConversationTitle(
    req: Request,
    res: Response
) {
    try {
        const id = Number(req.params.id);
        const title = req.body?.title?.trim();

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Conversation title is required",
            });
        }

        const conversation =
            await conversationRepository.updateTitle(
                id,
                title
            );

        return res.json({
            success: true,
            conversation,
        });

    } catch (error) {

        console.error(
            "Update conversation title error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function deleteConversation(
    req: Request,
    res: Response
) {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        await conversationRepository.delete(id);

        return res.json({
            success: true,
        });

    } catch (error) {

        console.error(
            "Delete conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}