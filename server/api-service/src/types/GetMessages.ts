import { Message } from "./Message";

export interface GetMessages {
  messages: Message[];
  next: boolean;
}
