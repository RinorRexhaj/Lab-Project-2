import { Request, Response } from "express";
import { RideService } from "../services/RideService";
import { io } from "../server";

export const requestRide = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, pickupLocation, dropoffLocation } = req.body;

  try {
    const newRide = await RideService.createRide({
      userId,
      pickupLocation,
      dropoffLocation,
    });

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
};
