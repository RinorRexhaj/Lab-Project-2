import { Server, Socket } from "socket.io";
import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";

export const registerSocketHandlers = (io: Server) => {
  const activeRides = new Map<
    string,
    { accepted: boolean; userSocketId: string }
  >();
  io.on("connection", (socket: Socket) => {
    // console.log("A user connected:", socket.id);

    socket.on("newRideRequest", (rideDetails) => {
      const rideId = rideDetails.response.id;
      const userSocketId = rideDetails.userSocketId;

      activeRides.set(rideId, {
        accepted: false,
        userSocketId,
      });
      const requestToSend = {
        rideId,
        userId: rideDetails.response.userId,
        pickupLocation: rideDetails.response.pickupLocation,
        dropoffLocation: rideDetails.response.dropoffLocation,
      };
      io.emit("receiveNewRideRequest", requestToSend);
    });

    socket.on("acceptRide", ({ rideId, driverName }) => {
      const ride = activeRides.get(rideId);

      if (!ride) {
        socket.emit("rideAlreadyAccepted", { rideId });
        return;
      }
      if (ride.accepted) {
        socket.emit("rideAlreadyAccepted", { rideId });
        return;
      }
      activeRides.set(rideId, { ...ride, accepted: true });

      io.to(ride.userSocketId).emit("rideAccepted", {
        driverUsername: driverName,
      });
      io.emit("rideNoLongerAvailable", { rideId });
    });

    socket.on("cancelRideRequest", ({ userSocketId, rideId }) => {
      activeRides.delete(rideId.toString());
      io.emit("rideRequestCancelled", { rideId });
    });

    socket.on("completeRide", async ({ rideId }) => {
      // Update ride status in the database
      const rideRepo = AppDataSource.getRepository(Ride);
      const ride = await rideRepo.findOneBy({ id: rideId });

      if (!ride) {
        console.error("Ride not found.");
        return;
      }

      ride.status = "completed";
      await rideRepo.save(ride);
      activeRides.delete(rideId);
      io.emit("rideCompleted", { rideId });
    });

    socket.on("driverLocation", ({ rideId, lat, lng }) => {
      const ride = activeRides.get(rideId);
      if (!ride) return;
      io.to(ride.userSocketId).emit("driverLocationUpdate", {
        rideId,
        lat,
        lng,
      });
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};
