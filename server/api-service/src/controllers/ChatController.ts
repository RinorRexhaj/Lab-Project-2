import { RequestHandler } from "express";
import {
  createMessage,
  getMessages as getMessagesUsers,
  getUsersWithConversations,
  searchChatUsers,
  updateMessagesToDelivered,
  updateUnseenMessagesToSeen,
} from "../services/MessageService";
import { chats, users as chatUsers } from "../chat/Chat";

export const sendMessage: RequestHandler = async (req, res): Promise<void> => {
  try {
    const message = await createMessage(req.body);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMessages: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { sender, receiver, page } = req.params;
    const messages = await getMessagesUsers(
      Number(sender),
      Number(receiver),
      Number(page)
    );
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const users = await getUsersWithConversations(Number(id));
    users.users = users.users.map((user) => {
      if (chatUsers.has(String(user.id))) return { ...user, active: true };
      return user;
    });
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const isUserActive: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const active = chatUsers.has(id);
    res.json({ active });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const isOnSameChat: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { sender, receiver } = req.params;
    const sameChat = chats.get(Number(receiver)) === Number(sender);
    res.json({ sameChat });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const searchUsers: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id, page, query } = req.query;
    const users = await searchChatUsers(
      Number(id),
      Number(page),
      query as string
    );
    res.json({ users });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const makeMessagesDelivered: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { sender } = req.body;
    await updateMessagesToDelivered(sender);
    res.status(200).json({ message: "Successfully delivered!" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const makeMessagesSeen: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { sender, receiver, page } = req.body;
    const messages = await updateUnseenMessagesToSeen(sender, receiver, page);
    res.status(200).json({ messages });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
