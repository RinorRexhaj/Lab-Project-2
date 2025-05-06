export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string; // "User", "Admin", "Driver", "Vendor"
  status: "active" | "suspended" | "banned";
  dateJoined: string;
  lastLogin: string;
  address?: string;
  avatar?: string;
}

export type UserRole = "User" | "Admin" | "Driver" | "Vendor";

export interface UserFilter {
  search: string;
  role: string;
  status: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  address?: string;
}

export interface SuspendUserData {
  reason: string;
  expiryDate?: string;
}
