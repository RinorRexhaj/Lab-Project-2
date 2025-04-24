export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "User" | "Admin" | "Driver";
  address?: string;
  avatar?: string;
}
