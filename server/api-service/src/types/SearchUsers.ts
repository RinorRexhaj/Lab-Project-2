import { ChatUser } from "./ChatUser";

export interface SearchUsers {
  users: ChatUser[];
  next: boolean;
}
