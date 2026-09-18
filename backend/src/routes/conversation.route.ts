import { Router } from "express";
import { createConversation } from "../controllers/conversation.controller";

const router = Router();

router.post("/", createConversation);

export default router;