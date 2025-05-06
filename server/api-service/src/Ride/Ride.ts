import { Server, Socket } from "socket.io";
import { AppDataSource } from "../data-source";
import { Ride } from "../models/Ride";

export const registerSocketHandlers = (io: Server) => {
  const activeRides = new Map<string, { accepted: boolean }>();
  io.on("connection", (socket: Socket) => {
    // console.log("A user connected:", socket.id);

    socket.on("newRideRequest", (rideDetails, userSocketId) => {
      const rideId = rideDetails.response.id;
      rideDetails.rideId = rideId;
      activeRides.set(rideId, {
        accepted: false,
      });
      io.emit("receiveNewRideRequest", rideDetails);
    });

    socket.on("acceptRide", ({ rideId, driverName, userSocketId }) => {
      const ride = activeRides.get(rideId);

      if (!ride || ride.accepted) {
        socket.emit("rideAlreadyAccepted", { rideId });
        return;
      }

      activeRides.set(rideId, { ...ride, accepted: true });

      io.to(userSocketId).emit("rideAccepted", {
        rideId,
        driverUsername: driverName,
      });
      io.emit("rideNoLongerAvailable", { rideId });
    });

    socket.on("cancelRideRequest", ({ userSocketId }) => {
      io.emit("rideRequestCancelled", { userSocketId });
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

    socket.on("driverLocation", ({ rideId, lat, lng, userSocketId }) => {
      io.to(userSocketId).emit("driverLocationUpdate", { rideId, lat, lng });
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};
