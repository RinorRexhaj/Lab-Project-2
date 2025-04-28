import { Server, Socket } from "socket.io";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // console.log("A user connected:", socket.id);

    socket.on("newRideRequest", (rideDetails) => {
      console.log(rideDetails);
      io.emit("receiveNewRideRequest", rideDetails);
    });

    socket.on("acceptRide", ({ rideId, driverUsername }) => {
      io.emit("rideAccepted", { rideId, driverUsername });
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
