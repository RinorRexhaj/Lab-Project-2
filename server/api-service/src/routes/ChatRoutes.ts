import { Router } from "express";
import {
  authenticateToken,
  authenticateUserToken,
} from "../services/TokenService";
import {
  getMessages,
  getUsers,
  isOnSameChat,
  isUserActive,
  makeMessagesDelivered,
  makeMessagesSeen,
  searchUsers,
  sendMessage,
} from "../controllers/ChatController";

const router = Router();

router.get("/users/:id", authenticateUserToken, getUsers);
router.get("/active/:id", authenticateToken, isUserActive);
router.get("/same/:sender/:receiver", authenticateToken, isOnSameChat);
router.get("/:sender/:receiver", authenticateToken, getMessages);
router.get("/users/", authenticateToken, searchUsers);
router.post("/", authenticateToken, sendMessage);
router.patch("/delivered", authenticateToken, makeMessagesDelivered);
router.patch("/seen", authenticateToken, makeMessagesSeen);

export default router;
