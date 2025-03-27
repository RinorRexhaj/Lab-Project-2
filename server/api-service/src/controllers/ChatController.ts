import { RequestHandler } from "express";
import {
  createMessage,
  getMessages as getMessagesUsers,
  getUsersWithConversations,
  updateMessagesToDelivered,
  updateUnseenMessagesToSeen,
} from "../services/MessageService";

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
    const { sender, receiver } = req.params;
    const messages = await getMessagesUsers(Number(sender), Number(receiver));
    res.json(messages);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const users = await getUsersWithConversations(Number(id));
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
    const { sender, receiver } = req.body;
    await updateMessagesToDelivered(sender, receiver);
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
    const { sender, receiver } = req.body;
    const messages = await updateUnseenMessagesToSeen(sender, receiver);
    res.status(200).json({ messages });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
