import { Server, Socket } from "socket.io";
import { Message } from "../types/Message";
import { MessageRepo } from "../repositories/MessageRepo";

export const users = new Map<string, string>();
export const chats = new Map<number, number>();

export const setupSocket = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      const alreadyConnected = users.has(String(userId));
      users.set(String(userId), socket.id);

      if (!alreadyConnected) {
        await MessageRepo.updateMessagesToDelivered(Number(userId));
      }
      // console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    socket.on("registerUser", (userId: string) => {
      users.set(userId, socket.id);
    });

    socket.on("openChat", async (userId: number, openChatId: number) => {
      chats.set(userId, openChatId);
      const user = users.get(String(openChatId));
      const seen = await MessageRepo.updateUnseenMessagesToSeen(
        openChatId,
        userId,
        1
      );
      if (user && seen) {
        io.to(user).emit("seenMessage", userId);
      }
    });

    socket.on("closeChat", (userId: number) => {
      chats.delete(userId);
    });

    socket.on("sendMessage", async (message: Message, page: number) => {
      const receiverSocketId = users.get(String(message.receiver));
      const senderSocketId = users.get(String(message.sender));
      if (receiverSocketId && senderSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
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

    socket.on("sendReaction", (message: Message) => {
      const receiverSocketId = users.get(String(message.sender));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveReaction", message);
      }
    });

    socket.on("disconnect", () => {
      users.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          let otherUser = chats.get(Number(userId));
          // users.delete(userId);
          // chats.delete(Number(userId));
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
