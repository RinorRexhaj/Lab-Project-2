import { Server, Socket } from "socket.io";
import { Message } from "../types/Message";
import { MessageRepo } from "../repositories/MessageRepo";

const users = new Map<string, string>();
const chats = new Map<number, number>();

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      users.set(userId, socket.id);
      // console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    socket.on("registerUser", (userId: string) => {
      users.set(userId, socket.id);
    });

    socket.on("openChat", async (userId: number, openChatId: number) => {
      chats.set(userId, openChatId);
      const user = users.get(String(openChatId));
      await MessageRepo.updateUnseenMessagesToSeen(openChatId, userId);
      if (user) {
        io.to(user).emit("seenMessage", userId);
      }
    });

    socket.on("closeChat", (userId: number) => {
      chats.delete(userId);
    });

    socket.on("sendMessage", async (message: Message) => {
      const receiverSocketId = users.get(String(message.receiver));
      const senderSocketId = users.get(String(message.sender));
      if (receiverSocketId && senderSocketId) {
        const sameChat = chats.get(message.receiver);
        io.to(receiverSocketId).emit("receiveMessage", message);
        if (sameChat === message.sender) {
          await MessageRepo.updateUnseenMessagesToSeen(
            message.sender,
            message.receiver
          );
          io.to(senderSocketId).emit("seenMessage", message.receiver);
        }
      } else {
        console.log(`User ${message.receiver} not found`);
      }
    });

    socket.on("sendTyping", (sender: number, receiver: number) => {
      const receiverSocketId = users.get(String(receiver));
      if (receiverSocketId) {
        const sameChat = chats.get(receiver);
        io.to(receiverSocketId).emit("receiveTyping", sender, sameChat);
      }
    });

    socket.on("removeTyping", (sender: number, receiver: number) => {
      removeTyping(sender, receiver);
    });

    socket.on("disconnect", () => {
      users.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          let otherUser = chats.get(Number(userId));
          users.delete(userId);
          chats.delete(Number(userId));
          if (otherUser) {
            removeTyping(Number(userId), Number(otherUser));
          }
          // console.log(`User ${userId} disconnected`);
        }
      });
    });

    const removeTyping = (sender: number, receiver: number) => {
      const receiverSocketId = users.get(String(receiver));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveRemoveTyping", sender);
      }
    };
  });
};
