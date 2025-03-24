import { FindOptionsWhere, In, IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Message } from "../models/Message";
import { Message as MessageType } from "../types/Message";
import { User } from "../models/User";
import { ChatUser } from "../types/ChatUser";

export class MessageRepo {
  static async createMessage(message: Partial<Message>): Promise<Message> {
    const messageRepo = AppDataSource.getRepository(Message);
    const newMessage = messageRepo.create(message);
    await messageRepo.save(newMessage);
    return newMessage;
  }

  static async getMessages(
    senderId: number,
    receiverId: number
  ): Promise<MessageType[]> {
    const messageRepo = AppDataSource.getRepository(Message);

    const messages = await messageRepo.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ] as FindOptionsWhere<Message>[],
      order: { id: "ASC" },
      relations: ["sender", "receiver"],
    });

    return messages.map((message) => ({
      id: message.id,
      sender: message.sender.id,
      receiver: message.receiver.id,
      text: message.text,
      sent: message.sent,
      seen: message.seen,
    }));
  }

  static async getUsersWithConversations(userId: number): Promise<ChatUser[]> {
    const messageRepo = AppDataSource.getRepository(Message);
    const userRepo = AppDataSource.getRepository(User);

    const messages = await messageRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      select: ["id", "sender", "receiver", "text", "sent", "seen"],
      relations: ["sender", "receiver"],
      order: { id: "DESC" },
    });

    const userIds = new Set<number>();
    messages.forEach((message) => {
      if (message.sender.id !== userId) userIds.add(message.sender.id);
      if (message.receiver.id !== userId) userIds.add(message.receiver.id);
    });

    if (userIds.size === 0) return [];

    const users = await userRepo.find({
      where: { id: In(Array.from(userIds)) },
      select: ["id", "fullName"],
    });

    const usersWithMessages: ChatUser[] = users.map((user) => {
      const conversationMessages = messages.filter(
        (message) =>
          (message.sender.id === user.id || message.receiver.id === user.id) &&
          (message.sender.id === userId || message.receiver.id === userId)
      );

      const lastMessage = conversationMessages[0] || null;

      const unseenMessagesCount = conversationMessages.filter(
        (message) =>
          message.receiver.id === userId && message.seen.getFullYear() === 2000
      ).length;

      return {
        id: user.id,
        fullName: user.fullName,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              sender: lastMessage.sender.id,
              receiver: lastMessage.receiver.id,
              text:
                unseenMessagesCount > 1
                  ? `${unseenMessagesCount} new messages`
                  : lastMessage.text,
              sent: lastMessage.sent,
              seen: lastMessage.seen,
            }
          : null,
      };
    });

    return usersWithMessages.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.sent).getTime() -
        new Date(a.lastMessage.sent).getTime()
      );
    });
  }

  static async updateUnseenMessagesToSeen(
    senderId: number,
    receiverId: number
  ): Promise<void> {
    const messageRepo = AppDataSource.getRepository(Message);

    await messageRepo.update(
      {
        sender: { id: senderId },
        receiver: { id: receiverId },
        seen: new Date("01/01/2000"),
      },
      { seen: new Date() }
    );
  }
}
