import { Router } from "express";
import {
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/UserController";
import { authenticateToken } from "../services/TokenService";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/id", authenticateToken, getUserById);
router.get("/email", authenticateToken, getUserByEmail);
router.patch("/", authenticateToken, updateUser);
router.delete("/", authenticateToken, deleteUser);

export default router;
