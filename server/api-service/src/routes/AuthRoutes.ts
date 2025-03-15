import { Router } from "express";
import {
  getUsers,
  login,
  refresh,
  register,
} from "../controllers/AuthController";
import { authenticateToken } from "../services/TokenService";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refresh);
router.get("/users", authenticateToken, getUsers);

export default router;
