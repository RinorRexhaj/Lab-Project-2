import { MessageRepo } from "../repositories/MessageRepo";
import { Message } from "../models/Message";
import { Message as MessageType } from "../types/Message";
import { SearchUsers } from "../types/SearchUsers";
import { GetUsers } from "../types/GetUsers";

export const createMessage = async (
  data: Partial<Message> & { replyTo?: { id: number } }
): Promise<MessageType> => {
  if (!data.sender || !data.receiver || !data.text) {
    throw new Error("Sender, receiver, and content are required.");
  }
  const message = await MessageRepo.createMessage(data);
  return message;
};

export const getMessages = async (
  senderId: number,
  receiverId: number,
  page: number
): Promise<MessageType[]> => {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required.");
  }
  if (!page) page = 1;
  return await MessageRepo.getMessages(senderId, receiverId, page);
};

export const getUsersWithConversations = async (
  userId: number
): Promise<GetUsers> => {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  return await MessageRepo.getUsersWithConversations(userId);
};

export const searchChatUsers = async (
  id: number,
  page: number,
  query: string
): Promise<SearchUsers> => {
  if (!page) {
    page = 1;
  }
  return await MessageRepo.searchUsers(id, page, query);
};

export const updateMessagesToDelivered = async (
  senderId: number
): Promise<void> => {
  if (!senderId) {
    throw new Error("senderId is required.");
  }
  await MessageRepo.updateMessagesToDelivered(senderId);
};

export const updateUnseenMessagesToSeen = async (
  senderId: number,
  receiverId: number,
  page: number
): Promise<boolean> => {
  if (!senderId || !receiverId) {
    throw new Error("Both senderId and receiverId are required.");
  }
  if (!page) page = 1;
  return await MessageRepo.updateUnseenMessagesToSeen(
    senderId,
    receiverId,
    page
  );
};
