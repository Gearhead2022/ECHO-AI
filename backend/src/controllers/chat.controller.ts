import { Request, Response } from "express";
import { chatService } from "../services/chat.service";

export async function chatController(
    req: Request,
    res: Response
) {

    console.log("📨 /chat received:", req.body);
    console.log(
        "🔖 Echo version:",
        req.headers["x-echo-version"]
    );
    console.log(
        "🆔 Echo conversation:",
        req.headers["x-echo-conversation"]
    );
    try {
        const {
            conversationId,
            message,
        } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required",
            });
        }

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const response = await chatService(
            Number(conversationId),
            message
        );

        return res.json(response);

    } catch (error) {

        console.error("Chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}