// src/hooks/useChatSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { environment } from "../environment/environment";
import { useUserStore } from "../store/useUserStore";
import { useChatStore } from "../store/useChatStore";
import { Message } from "../types/Message";
import useApi from "./useApi";

const SOCKET_SERVER_URL = environment.apiUrl;

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserStore();
  const { currentUser, addMessage, setUsers, setMessages } = useChatStore();
  const { get, post, patch } = useApi();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_SERVER_URL, { query: { userId: user.id } });
    setSocket(newSocket);

    getUsers();

    newSocket.on("receiveMessage", (message) => {
      receiveMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  };

  const getMessages = async (receiver: number) => {
    if (socket && user && receiver) {
      const messages: Message[] = await get(`/chat/${user.id}/${receiver}`);
      setMessages(messages);
    }
  };

  const getUsers = async () => {
    setMessages([]);
    const { users } = await get(`/chat/users/${user?.id}`);
    setUsers(users);
  };

  const sendMessage = async (receiver: number, text: string) => {
    if (socket && user) {
      const message: Message = await post("/chat/", {
        sender: user.id,
        receiver,
        text,
        sent: new Date(),
        seen: new Date("01/01/2000"),
      });
      addMessage(message);
      socket.emit("sendMessage", message);
    }
  };

  const receiveMessage = (message: Message) => {
    if (user && message) {
      if (currentUser) {
        addMessage(message);
      } else {
        getUsers();
      }
    }
  };

  const setSeen = async (sender: number) => {
    if (socket && user) {
      await patch("/chat/seen", { sender, receiver: user.id });
    }
  };

  return { getUsers, getMessages, sendMessage, setSeen };
};
