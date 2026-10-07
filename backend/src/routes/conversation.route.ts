import { Router } from "express";
import { createConversation, getConversation, getConversations, updateConversationTitle, deleteConversation } from "../controllers/conversation.controller";

const router = Router();

router.post("/", createConversation);

router.get("/", getConversations);
router.patch("/:id/title", updateConversationTitle);
router.delete("/:id", deleteConversation);
router.get("/:id", getConversation);

export default router;