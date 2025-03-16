export interface User {
  ID?: number;
  FullName: string;
  Email: string;
  Password: string;
  Role: "User" | "Admin";
  Address?: string;
}
