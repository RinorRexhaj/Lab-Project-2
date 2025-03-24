import { Server, Socket } from "socket.io";
import { Message } from "../types/Message";

const users = new Map<string, string>();

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      users.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    socket.on("registerUser", (userId: string) => {
      users.set(userId, socket.id);
    });

    socket.on("sendMessage", (message: Message) => {
      const receiverSocketId = users.get(String(message.receiver));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      } else {
        console.log(`User ${message.receiver} not found`);
      }
    });

    socket.on("disconnect", () => {
      users.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          users.delete(userId);
          // console.log(`User ${userId} disconnected`);
        }
      });
    });
  });
};
