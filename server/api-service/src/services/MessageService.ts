import { MessageRepo } from "../repositories/MessageRepo";
import { Message } from "../models/Message";
import { Message as MessageType } from "../types/Message";
import { ChatUser } from "../types/ChatUser";

export const createMessage = async (
  data: Partial<Message>
): Promise<Message> => {
  if (!data.sender || !data.receiver || !data.text) {
    throw new Error("Sender, receiver, and content are required.");
  }
  const message = await MessageRepo.createMessage(data);
  return message;
};

export const getMessages = async (
  senderId: number,
  receiverId: number
): Promise<MessageType[]> => {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required.");
  }
  return await MessageRepo.getMessages(senderId, receiverId);
};

export const getUsersWithConversations = async (
  userId: number
): Promise<ChatUser[]> => {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  return await MessageRepo.getUsersWithConversations(userId);
};

export const updateMessagesToDelivered = async (
  senderId: number,
  receiverId: number
): Promise<void> => {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required.");
  }
  await MessageRepo.updateMessagesToDelivered(senderId, receiverId);
};

export const updateUnseenMessagesToSeen = async (
  senderId: number,
  receiverId: number
): Promise<MessageType[]> => {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required.");
  }
  return await MessageRepo.updateUnseenMessagesToSeen(senderId, receiverId);
};
