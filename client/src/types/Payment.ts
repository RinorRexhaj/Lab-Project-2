import { User } from "./User";

export interface Payment {
  id: number;
  totalPrice: number;
  createdAt: Date;
  user: User;
}
