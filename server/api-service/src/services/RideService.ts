import { log } from "console";
import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";

export class RideService {
  static async completeRide(rideId: number) {
    const rideRepo = AppDataSource.getRepository(Ride);
    const ride = await rideRepo.findOneBy({ id: rideId });

    if (!ride) {
      throw new Error("Ride not found");
    }

    ride.status = "completed";
    ride.completedAt = new Date();

    return await rideRepo.save(ride);
  }
}
