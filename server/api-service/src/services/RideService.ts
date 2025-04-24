import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";
import { User } from "../models/User";

export class RideService {
  static async createRide({
    userId,
    pickupLocation,
    dropoffLocation,
  }: {
    userId: number;
    pickupLocation: string;
    dropoffLocation: string;
  }) {
    const rideRepo = AppDataSource.getRepository(Ride);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneByOrFail({ id: userId });

    const ride = rideRepo.create({
      user,
      pickupLocation,
      dropoffLocation,
      status: "pending",
    });

    return await rideRepo.save(ride);
  }
}
