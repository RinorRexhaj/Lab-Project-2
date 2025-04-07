import { ChatUser } from "./ChatUser";

export interface GetUsers {
  users: ChatUser[];
  newChats: number;
}
