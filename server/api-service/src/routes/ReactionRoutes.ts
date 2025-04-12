import { Router } from "express";
import { reactToMessage } from "../controllers/ReactionController";
import { authenticateToken } from "../services/TokenService";

const router = Router();

router.post("/:messageId", authenticateToken, reactToMessage);

export default router;
