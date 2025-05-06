import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";
import { User } from "../models/User";

export class RideRepo {
  static async createRide(
    rideData: Partial<Ride>,
    userId: number,
    driverId?: number
  ): Promise<Ride | null> {
    const rideRepo = AppDataSource.getRepository(Ride);
    const userRepo = AppDataSource.getRepository(User);

    // Fetch the user and optionally the driver
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const driver = driverId ? await userRepo.findOneBy({ id: driverId }) : null;

    // Create and save the ride
    const newRide = rideRepo.create({
      ...rideData,
      user: user, // Attach the user to the ride
      driver: driver || undefined, // Attach the driver if available
    });
    await rideRepo.save(newRide);

    // Return the ride with its relations
    return await this.getRideById(newRide.id);
  }

  static async getRideById(rideId: number): Promise<Ride | null> {
    const rideRepo = AppDataSource.getRepository(Ride);
    return await rideRepo.findOne({
      where: { id: rideId },
      relations: ["user", "driver"], // Load user and driver relations
    });
  }

  static async getUserRides(userId: number): Promise<Ride[]> {
    const rideRepo = AppDataSource.getRepository(Ride);
    return (
      (await rideRepo.find({
        where: { user: { id: userId } }, // Use relation with user
        relations: ["driver"], // Load the driver relation
        order: { id: "DESC" },
      })) || []
    );
  }

  static async getDriverRides(driverId: number): Promise<Ride[]> {
    const rideRepo = AppDataSource.getRepository(Ride);
    return (
      (await rideRepo.find({
        where: { driver: { id: driverId } }, // Use relation with driver
        relations: ["user"], // Load the user relation
        order: { id: "DESC" },
      })) || []
    );
  }

  static async acceptRide(
    rideId: number,
    driverId: number
  ): Promise<Ride | null> {
    const rideRepo = AppDataSource.getRepository(Ride);
    const ride = await rideRepo.findOne({
      where: { id: rideId },
      relations: ["user", "driver"],
    });

    if (ride && ride.status === "pending") {
      const driverRepo = AppDataSource.getRepository(User);
      const driver = await driverRepo.findOneBy({ id: driverId });

      if (driver) {
        ride.driver = driver; // Assign the driver to the ride
        ride.status = "accepted"; // Change status to accepted
        await rideRepo.save(ride);
        return ride;
      }
    }

    return null;
  }

  static async completeRide(rideId: number, status: string): Promise<void> {
    const rideRepo = AppDataSource.getRepository(Ride);
    await rideRepo.update(rideId, { status: "completed" });
  }
}
