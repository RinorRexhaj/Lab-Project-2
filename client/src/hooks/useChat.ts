import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { environment } from "../environment/environment";
import { useUserStore } from "../store/useUserStore";
import { useChatStore } from "../store/useChatStore";
import { Message } from "../types/Message";
import useApi from "./useApi";
import { useChatUsersStore } from "../store/useChatUsersStore";

const SOCKET_SERVER_URL = environment.apiUrl;

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserStore();
  const {
    openUser,
    addTyping,
    addMessage,
    reactMessage,
    setMessages,
    setMessagesSeen,
    setNewMessages,
    setCurrentTyping,
    removeTyping: rmvTyping,
  } = useChatStore();

  const { setUsers } = useChatUsersStore();
  const { get, post } = useApi();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_SERVER_URL, { query: { userId: user.id } });
    setSocket(newSocket);

    newSocket.on("receiveMessage", (message: Message) => {
      receiveMessage(message);
    });

    newSocket.on("seenMessage", (receiver: number) => {
      if (openUser?.id === receiver) setMessagesSeen(user.id);
      else if (!openUser) getUsers();
    });

    newSocket.on(
      "receiveTyping",
      (sender: number, sameChat: number | undefined) => {
        receiveTyping(sender, sameChat);
      }
    );

    newSocket.on("receiveRemoveTyping", (sender: number) => {
      rmvTyping(sender);
    });

    newSocket.on("receiveReaction", (message: Message) => {
      if (openUser?.id === message.receiver)
        reactMessage(message.id, message.reaction);
    });

    return () => {
      newSocket.disconnect();
    };
  };

  const getMessages = async (receiver: number) => {
    if (user && receiver) {
      const messages: Message[] = await get(`/chat/${user.id}/${receiver}`);
      setMessages(messages);
    }
  };

  const getUsers = async () => {
    setMessages([]);
    const { users, newChats } = await get(`/chat/users/${user?.id}`);
    setNewMessages(newChats);
    setUsers(users);
  };

  const openChat = async (openChatId: number) => {
    if (socket && user) {
      socket.emit("openChat", user.id, openChatId);
    }
  };

  const closeChat = async () => {
    if (socket && user) {
      socket.emit("closeChat", user.id);
    }
  };

  const sendMessage = async (
    receiver: number,
    text: string,
    reply?: Message
  ) => {
    if (socket && user) {
      const { active } = await get("/chat/active/" + receiver);
      let same = null;
      if (active) {
        const { sameChat } = await get(`/chat/same/${user.id}/${receiver}`);
        same = sameChat;
      }
      const message: Message = await post("/chat/", {
        sender: user.id,
        receiver,
        text,
        sent: new Date(),
        delivered: active ? new Date() : new Date("01/01/2000"),
        seen: same ? new Date() : new Date("01/01/2000"),
        replyTo: reply,
      });
      addMessage(message);
      socket.emit("sendMessage", message);
    }
  };

  const receiveMessage = (message: Message) => {
    if (user && message) {
      if (openUser?.id === message.sender) {
        addMessage(message);
      } else if (!openUser) {
        getUsers();
      }
    }
  };

  const sendTyping = () => {
    if (socket && user && openUser) {
      socket.emit("sendTyping", user.id, openUser.id);
    }
  };

  const receiveTyping = (sender: number, sameChat: number | undefined) => {
    addTyping(sender);
    if (sameChat && openUser) {
      setCurrentTyping(true);
    }
  };

  const sendRemoveTyping = (receiver: number) => {
    if (socket && user && receiver) {
      socket.emit("removeTyping", user.id, receiver);
    }
  };

  const sendReaction = async (message: Message) => {
    if (socket && user) {
      const { sameChat } = await get(`/chat/same/${user.id}/${message.sender}`);
      if (sameChat) {
        socket.emit("sendReaction", message);
      }
      await post("/reaction/" + message.id, { reaction: message.reaction });
    }
  };

  return {
    getUsers,
    getMessages,
    openChat,
    closeChat,
    sendMessage,
    sendTyping,
    receiveTyping,
    sendRemoveTyping,
    sendReaction,
  };
};
