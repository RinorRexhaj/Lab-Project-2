import { User } from "../User";

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}
