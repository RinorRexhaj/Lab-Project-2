import { Request, Response } from "express";
import { RideService } from "../services/RideService";
import { io } from "../server";

export class RideController {
  static async requestRide(req: Request, res: Response) {
    const { userId, pickupLocation, dropoffLocation } = req.body;

    try {
      const newRide = await RideService.createRide({
        userId,
        pickupLocation,
        dropoffLocation,
      });

      // Emit ride request to all connected drivers
      io.emit("newRideRequest", {
        rideId: newRide.id,
        pickupLocation: newRide.pickupLocation,
        dropoffLocation: newRide.dropoffLocation,
        userId: newRide.user.id,
      });

      return res.status(201).json(newRide);
    } catch (err) {
      console.error("Ride request error:", err);
      return res.status(500).json({ message: "Failed to request ride" });
    }
  }
}
