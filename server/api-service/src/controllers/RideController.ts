import { Request, Response } from "express";
import { RideService } from "../services/RideService";
import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";
import { RequestHandler } from "express";
import { User } from "../models/User";

export const bookRide = async (req: Request, res: Response): Promise<void> => {
  const { pickupLocation, dropoffLocation, userId } = req.body;

  try {
    const rideRepo = AppDataSource.getRepository(Ride);
    const userRepo = AppDataSource.getRepository(User);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const newRide = rideRepo.create({
      user,
      pickupLocation,
      dropoffLocation,
      status: "pending",
    });

    const savedRide = await rideRepo.save(newRide);

    res.status(201).json(savedRide);
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ message: "Failed to book ride" });
  }
};

export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rideRepo = AppDataSource.getRepository(Ride);
    const rides = await rideRepo.find({
      relations: ["user", "driver"],
      order: { completedAt: "DESC" },
    });

    res.json(rides);
  } catch (error) {
    console.error("Error fetching all rides:", error);
    res.status(500).json({ error: "Failed to fetch rides" });
  }
};

export const getUserRides = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  try {
    const rideRepo = AppDataSource.getRepository(Ride);
    const rides = await rideRepo.find({
      where: { user: { id: userId } },
      relations: ["driver"], // fetch driver info
      order: { completedAt: "DESC" },
    });

    res.json(rides);
  } catch (err) {
    console.error("Failed to fetch user rides:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const completeRide = async (req: Request, res: Response) => {
  const { rideId, driverId } = req.body;
  const rideRepo = AppDataSource.getRepository(Ride);
  await rideRepo.update(rideId, {
    status: "completed",
    driver: { id: driverId },
  });
  res.send({ message: "Ride marked as completed" });
};

export const deleteRide: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Ride ID" });
    }

    const rideRepo = AppDataSource.getRepository(Ride);
    const ride = await rideRepo.findOne({ where: { id: parseInt(id) } });

    if (!ride) {
      res.status(404).json({ error: "Ride not found" });
      return;
    }

    await rideRepo.remove(ride);
    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
