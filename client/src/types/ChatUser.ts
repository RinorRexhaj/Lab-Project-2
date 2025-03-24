import { Message } from "./Message";

export interface ChatUser {
  id: number;
  fullName: string;
  lastMessage: Message;
}
