import { Router } from "express";
import {
  authenticateToken,
  authenticateUserToken,
} from "../services/TokenService";
import {
  getMessages,
  getUsers,
  makeMessagesSeen,
  sendMessage,
} from "../controllers/ChatController";

const router = Router();

router.get("/users/:id", authenticateUserToken, getUsers);
router.get("/:sender/:receiver", authenticateToken, getMessages);
router.post("/", authenticateToken, sendMessage);
router.patch("/seen", authenticateToken, makeMessagesSeen);

export default router;
