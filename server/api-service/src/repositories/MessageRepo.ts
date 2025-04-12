import { FindOptionsWhere, In, IsNull, Like, Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Message } from "../models/Message";
import { Message as MessageType } from "../types/Message";
import { User } from "../models/User";
import { ChatUser } from "../types/ChatUser";
import { SearchUsers } from "../types/SearchUsers";
import { GetUsers } from "../types/GetUsers";
import { Reply } from "../models/Reply";
import { Reaction } from "../models/Reaction";

export class MessageRepo {
  static messageRepo = AppDataSource.getRepository(Message);
  static userRepo = AppDataSource.getRepository(User);
  static replyRepo = AppDataSource.getRepository(Reply);
  static reactionRepo = AppDataSource.getRepository(Reaction);

  static async createMessage(
    message: Partial<Message> & { replyTo?: { id: number } }
  ): Promise<MessageType> {
    const replyToId = message.replyTo?.id;
    const { replyTo, ...messageData } = message;

    const newMessage = MessageRepo.messageRepo.create(messageData);
    await MessageRepo.messageRepo.save(newMessage);

    let replyToMessage: Message | null = null;

    if (replyToId) {
      const reply = MessageRepo.replyRepo.create({
        message: newMessage,
        replyTo: { id: replyToId } as Message,
      });
      await MessageRepo.replyRepo.save(reply);

      replyToMessage = await MessageRepo.messageRepo.findOne({
        where: { id: replyToId },
        relations: ["sender"],
      });
    }

    const fullMessage = await MessageRepo.messageRepo.findOneOrFail({
      where: { id: newMessage.id },
      relations: ["sender", "receiver"],
    });

    return {
      id: fullMessage.id,
      sender: fullMessage.sender.id,
      receiver: fullMessage.receiver.id,
      text: fullMessage.text,
      sent: fullMessage.sent,
      delivered: fullMessage.delivered,
      seen: fullMessage.seen,
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            text: replyToMessage.text,
            sender: replyToMessage.sender?.id ?? null,
          }
        : undefined,
    };
  }

  static async getMessages(
    senderId: number,
    receiverId: number,
    page: number
  ): Promise<MessageType[]> {
    const pageSize = 50;

    if (!page) page = 1;

    const messages = await MessageRepo.messageRepo.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ] as FindOptionsWhere<Message>[],
      order: { id: "ASC" },
      relations: ["sender", "receiver"],
      take: pageSize + 1,
      skip: (page - 1) * pageSize,
    });

    const messageIds = messages.map((m) => m.id);

    const replies = await MessageRepo.replyRepo.find({
      where: {
        message: { id: In(messageIds) },
      },
      relations: ["message", "replyTo", "replyTo.sender"],
    });

    const replyMap = new Map<number, Reply>();
    for (const reply of replies) {
      replyMap.set(reply.message.id, reply);
    }

    const reactions = await this.reactionRepo.find({
      where: { message: { id: In(messageIds) } },
      relations: ["message"],
    });

    const reactionMap = new Map<number, string>();
    for (const reaction of reactions) {
      reactionMap.set(reaction.message.id, reaction.reaction);
    }

    const hasNextPage = messages.length > pageSize;

    return messages.map((message) => {
      const reply = replyMap.get(message.id);
      const reaction = reactionMap.get(message.id);

      return {
        id: message.id,
        sender: message.sender.id,
        receiver: message.receiver.id,
        text: message.text,
        sent: message.sent,
        delivered: message.delivered,
        seen: message.seen,
        reaction: reaction ?? undefined,
        replyTo: reply
          ? {
              id: reply.replyTo.id,
              text: reply.replyTo.text,
              sender: reply.replyTo.sender?.id ?? null,
            }
          : undefined,
      };
    });
  }

  static async getUsersWithConversations(userId: number): Promise<GetUsers> {
    const messages = await MessageRepo.messageRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      select: ["id", "sender", "receiver", "text", "sent", "delivered", "seen"],
      relations: ["sender", "receiver"],
      order: { id: "DESC" },
    });

    const userIds = new Set<number>();
    messages.forEach((message) => {
      if (message.sender.id !== userId) userIds.add(message.sender.id);
      if (message.receiver.id !== userId) userIds.add(message.receiver.id);
    });

    if (userIds.size === 0) return { users: [], newChats: 0 };

    const users = await MessageRepo.userRepo.find({
      where: { id: In(Array.from(userIds)) },
      select: ["id", "fullName"],
    });

    let newChats = 0;

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

      if (unseenMessagesCount > 0) newChats++;

      return {
        id: user.id,
        fullName: user.fullName,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              sender: lastMessage.sender.id,
              receiver: lastMessage.receiver.id,
              text:
                unseenMessagesCount > 1 && lastMessage.sender.id !== userId
                  ? `${unseenMessagesCount} new messages`
                  : lastMessage.text,
              sent: lastMessage.sent,
              delivered: lastMessage.delivered,
              seen: lastMessage.seen,
            }
          : null,
      };
    });

    return {
      users: usersWithMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return (
          new Date(b.lastMessage.sent).getTime() -
          new Date(a.lastMessage.sent).getTime()
        );
      }),
      newChats,
    };
  }

  static async searchUsers(
    id: number,
    page: number,
    query: string
  ): Promise<SearchUsers> {
    if (!page) page = 1;
    const pageSize = 25;

    const users = await MessageRepo.userRepo.find({
      where: { id: Not(id), fullName: Like(`%${query}%`) },
      select: ["id", "fullName"],
      take: pageSize + 1,
      skip: (page - 1) * pageSize,
    });

    const hasNextPage = users.length > pageSize;
    if (hasNextPage) users.pop();

    if (users.length === 0) return { users: [], next: false };

    const userIds = users.map((user) => user.id);

    const messages = await MessageRepo.messageRepo.find({
      where: [
        { sender: { id: In(userIds) } },
        { receiver: { id: In(userIds) } },
      ],
      select: ["id", "sender", "receiver", "text", "sent", "delivered", "seen"],
      relations: ["sender", "receiver"],
      order: { id: "DESC" },
    });

    const usersWithMessages: ChatUser[] = users.map((user) => {
      const conversationMessages = messages.filter(
        (message) =>
          (message.sender.id === user.id || message.receiver.id === user.id) &&
          (message.sender.id === id || message.receiver.id === id)
      );

      const lastMessage = conversationMessages[0] || null;

      const unseenMessagesCount = conversationMessages.filter(
        (message) =>
          message.receiver.id === id && message.seen.getFullYear() === 2000
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
                unseenMessagesCount > 1 && lastMessage.sender.id !== id
                  ? `${unseenMessagesCount} new messages`
                  : lastMessage.text,
              sent: lastMessage.sent,
              delivered: lastMessage.delivered,
              seen: lastMessage.seen,
            }
          : null,
      };
    });

    const sortedUsers = usersWithMessages.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.sent).getTime() -
        new Date(a.lastMessage.sent).getTime()
      );
    });

    return { users: sortedUsers, next: hasNextPage };
  }

  static async updateMessagesToDelivered(senderId: number): Promise<void> {
    await MessageRepo.messageRepo.update(
      {
        receiver: { id: senderId },
        delivered: new Date("01/01/2000"),
      },
      { delivered: new Date() }
    );
  }

  static async updateUnseenMessagesToSeen(
    senderId: number,
    receiverId: number,
    page: number
  ): Promise<boolean> {
    const messages = await MessageRepo.messageRepo.update(
      {
        sender: { id: senderId },
        receiver: { id: receiverId },
        seen: new Date("01/01/2000"),
      },
      { seen: new Date() }
    );

    return messages.affected ? messages.affected > 0 : false;
  }
}
