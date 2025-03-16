import { Router } from "express";
import {
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/UserController";
import {
  authenticateToken,
  authenticateUserToken,
} from "../services/TokenService";

const router = Router();

router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateUserToken, getUserById);
router.get("/email", authenticateToken, getUserByEmail);
router.patch("/:id", authenticateUserToken, updateUser);
router.delete("/:id", authenticateUserToken, deleteUser);

export default router;
