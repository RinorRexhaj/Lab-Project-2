export interface User {
  id: number;
  fullname: string;
  email: string;
  role: "User" | "Admin";
  address?: string;
}
