import { Router } from "express";
import {
  authenticateAdminToken,
  authenticateToken,
  authenticateUserToken,
} from "../services/TokenService";
import {
  getUserRides,
  getAllRides,
  completeRide,
  deleteRide,
  bookRide,
} from "../controllers/RideController";

const router = Router();
// router.post("/rides", requestRide);
router.post("/booked", authenticateToken, bookRide);
router.post("/complete", authenticateToken, completeRide);
router.get("/user/:userId", getUserRides);
router.get("/all", authenticateAdminToken, getAllRides);
router.delete("/:id", deleteRide);
export default router;
