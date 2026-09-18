import { Request, Response } from "express";
import { conversationRepository, } from "../repositories";

export async function createConversation(req: Request, res: Response) {

    const conversation =
        await conversationRepository.create();

    return res.json(conversation);

}