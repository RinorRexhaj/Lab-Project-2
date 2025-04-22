import { Router } from "express";
import { RideController } from "../controllers/RideController";

const router = Router();

router.post("/rides", RideController.requestRide);

export default router;
