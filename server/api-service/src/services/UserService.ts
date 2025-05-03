import { isValidEmail } from "../controllers/AuthController";
import { UserRepo } from "../repositories/UserRepo";

export const getAllUsers = async () => {
  return await UserRepo.getUsers();
};

export const getUserId = async (id: number) => {
  if (!id) return null;
  return await UserRepo.findById(id);
};

export const getUserEmail = async (email: string) => {
  if (!email || !isValidEmail(email)) return null;
  return await UserRepo.findByEmail(email);
};

export const updateUserData = async (
  id: number,
  fullname: string,
  role: string,
  address: string,
  avatar?: string,
  status?: string,
  email?: string
) => {
  if (!id) return null;
  return await UserRepo.updateUser(id, fullname, role, address, avatar, status, email);
};

export const updateUserStatus = async (
  id: number,
  status: string,
  reason?: string,
  expiryDate?: Date
) => {
  if (!id || !status) return null;
  return await UserRepo.updateUserStatus(id, status, reason, expiryDate);
};

export const updateUserAvatar = async (id: number, avatar: string) => {
  if (!id || !avatar) return null;
  return await UserRepo.updateAvatar(id, avatar);
};

export const updateUserPassword = async (id: number, currentPassword: string, newPassword: string) => {
  if (!id || !currentPassword || !newPassword) return null;
  return await UserRepo.updatePassword(id, currentPassword, newPassword);
};

export const adminResetPassword = async (id: number, hashedPassword: string) => {
  if (!id || !hashedPassword) return null;
  return await UserRepo.adminResetPassword(id, hashedPassword);
};

export const deleteUserId = async (id: number) => {
  if (!id) return null;
  return await UserRepo.deleteUser(id);
};
