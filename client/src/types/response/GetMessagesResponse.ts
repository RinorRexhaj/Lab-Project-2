import { Message } from "../Message";

export interface GetMessagesResponse {
  messages: Message[];
  next: boolean;
}
