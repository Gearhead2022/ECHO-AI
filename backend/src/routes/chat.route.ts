import { Router } from "express";
import { chatController, } from "../controllers/chat.controller";

const router = Router();

router.post("/", chatController);

// router.post("/stream", chatStreamController);

export default router;