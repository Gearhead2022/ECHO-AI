import { Router } from "express";

import {
    getMemories,
    deleteMemory,
    updateMemory
} from "../controllers/memory.controller";

const router = Router();

router.get("/", getMemories);

router.patch("/:key", updateMemory);

router.delete("/:key", deleteMemory);

export default router;