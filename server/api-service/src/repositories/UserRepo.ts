import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { Message } from "../models/Message";
import bcrypt from "bcryptjs";

export class UserRepo {
  static async createUser(user: Partial<User>): Promise<void> {
    const userRepo = AppDataSource.getRepository(User);
    const newUser = userRepo.create(user);
    await userRepo.save(newUser);
  }

  static async getUsers(): Promise<User[]> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.find();
  }

  static async findById(id: number): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { email } });
  }

  static async updateUser(
    id: number,
    fullname: string,
    role: string,
    address: string,
    avatar?: string,
    status?: string,
    email?: string
  ): Promise<User | null> {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id } });
      if (!user) return null;

      // Only update fields that are provided
      if (fullname) user.fullName = fullname;
      if (role) user.role = role;
      // Address can be empty string to clear it
      user.address = address;
      if (avatar) user.avatar = avatar;
      if (status) user.status = status;
      if (email) user.email = email;

      await userRepo.save(user);
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
  
  static async updateUserStatus(
    id: number,
    status: string,
    reason?: string,
    expiryDate?: Date
  ): Promise<User | null> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id } });
      
      if (!user) return null;
      
      user.status = status;
      
      if (status === 'suspended') {
        if (reason) {
          user.suspendReason = reason;
        }
        
        if (expiryDate) {
          user.suspendExpiryDate = expiryDate;
        } else {
          user.suspendExpiryDate = undefined;
        }
      } else if (status === 'active') {
        // Clear suspension data when activating a user
        user.suspendReason = undefined;
        user.suspendExpiryDate = undefined;
      }
      
      await userRepo.save(user);
      return user;
    } catch (error) {
      console.error('Error updating user status:', error);
      return null;
    }
  }
  
  static async updateLastLogin(id: number): Promise<boolean> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id } });
      
      if (!user) return false;
      
      user.lastLogin = new Date();
      await userRepo.save(user);
      return true;
    } catch (error) {
      console.error('Error updating last login:', error);
      return false;
    }
  }
  
  static async updateAvatar(
    id: number,
    avatar: string
  ): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return null;

    user.avatar = avatar;

    await userRepo.save(user);
    return user;
  }
  
  static async adminResetPassword(
    id: number,
    hashedPassword: string
  ): Promise<User | null> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id } });
      
      if (!user) return null;
      
      // Update the password directly (admin override)
      user.password = hashedPassword;
      await userRepo.save(user);
      return user;
    } catch (error) {
      console.error('Error resetting password:', error);
      return null;
    }
  }
  
  static async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return null;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await userRepo.save(user);
    return user;
  }

  static async deleteUser(id: number): Promise<boolean> {
    try {
      console.log(`Attempting to delete user with ID: ${id}`);
      
      const userRepo = AppDataSource.getRepository(User);
      
      // Check if user exists
      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        console.log(`User with ID ${id} not found`);
        return false;
      }
      
      // Use the repository's remove method which triggers cascades
      await userRepo.remove(user);
      
      console.log(`Successfully deleted user with ID: ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }
}
