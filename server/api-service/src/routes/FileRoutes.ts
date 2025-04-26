import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../services/TokenService";
import {
  downloadFile,
  getFileDetails,
  uploadFile,
} from "../controllers/FileController";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload/:messageId",
  authenticateToken,
  upload.single("file"),
  uploadFile
);
router.get("/:messageId", authenticateToken, getFileDetails);
router.get("/download/:messageId", authenticateToken, downloadFile);

export default router;
