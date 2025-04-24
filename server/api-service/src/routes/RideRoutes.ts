import { Router } from "express";
import { requestRide } from "../controllers/RideController";

const router = Router();
router.post("/rides", requestRide);
export default router;
