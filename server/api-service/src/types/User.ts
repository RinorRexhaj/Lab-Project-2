export interface User {
  ID?: number;
  FullName: string;
  Email: string;
  Password: string;
  Role: string | "User";
  Address?: string;
}
