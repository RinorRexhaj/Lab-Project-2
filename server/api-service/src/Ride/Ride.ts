import { Server, Socket } from "socket.io";

export const registerSocketHandlers = (io: Server) => {
  const activeRides = new Map<string, { accepted: boolean }>();
  io.on("connection", (socket: Socket) => {
    // console.log("A user connected:", socket.id);

    socket.on("newRideRequest", (rideDetails) => {
      const rideId = socket.id;
      rideDetails.rideId = rideId;
      activeRides.set(rideId, { accepted: false });
      console.log(rideDetails);
      io.emit("receiveNewRideRequest", rideDetails);
    });

    // socket.on("acceptRide", ({ rideId, driverUsername }) => {
    //   io.emit("rideAccepted", { rideId, driverUsername });
    // });

    socket.on("acceptRide", ({ rideId, driverName, userSocketId }) => {
      const ride = activeRides.get(rideId);

      if (!ride || ride.accepted) {
        socket.emit("rideAlreadyAccepted", { rideId });
        return;
      }

      activeRides.set(rideId, { accepted: true });

      io.to(userSocketId).emit("rideAccepted", {
        rideId,
        driverUsername: driverName,
      });
      io.emit("rideNoLongerAvailable", { rideId });
    });

    socket.on("cancelRideRequest", ({ userSocketId }) => {
      console.log("Ride request cancelled by user:", userSocketId);
      io.emit("rideRequestCancelled", { userSocketId });
    });

    socket.on("completeRide", ({ rideId }) => {
      console.log(`Ride ${rideId} marked as completed.`);
      activeRides.delete(rideId);
      io.emit("rideCompleted", { rideId });
    });

    socket.on("driverLocation", ({ rideId, lat, lng, userSocketId }) => {
      console.log(
        "Received driverLocation from driver:",
        lat,
        lng,
        "to userSocketId:",
        userSocketId
      );
      io.to(userSocketId).emit("driverLocationUpdate", { rideId, lat, lng });
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};
