import { Router } from "express";
import {
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  updateAvatar,
  updatePassword,
} from "../controllers/UserController";
import {
  authenticateAdminToken,
  authenticateUserToken,
} from "../services/TokenService";

const router = Router();

router.get("/", authenticateUserToken, getUsers);
router.get("/:id", authenticateUserToken, getUserById);
router.get("/email", authenticateAdminToken, getUserByEmail);
router.patch("/:id", authenticateUserToken, updateUser);
router.patch("/:id/avatar", authenticateUserToken, updateAvatar);
router.patch("/:id/password", authenticateUserToken, updatePassword);
router.delete("/:id", authenticateUserToken, deleteUser);

export default router;
