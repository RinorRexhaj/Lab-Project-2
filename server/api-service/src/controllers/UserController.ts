import { RequestHandler } from "express";
import { AppDataSource } from "../data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import bcrypt from "bcryptjs";
import {
  deleteUserId,
  getAllUsers,
  getUserEmail,
  getUserId,
  updateUserData,
  updateUserAvatar,
  updateUserPassword,
  updateUserStatus,
  adminResetPassword
} from "../services/UserService";
import { isValidEmail } from "./AuthController";
import { extractUserRole } from "../services/TokenService";

export const getUsers: RequestHandler = async (req, res): Promise<void> => {
  const users = await getAllUsers();
  res.json({ users });
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: "Invalid ID" });
      return;
    }
    const user = await getUserId(parseInt(id));
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};

export const getUserByEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      res.status(404).json({ error: "Invalid Email" });
      return;
    }
    const user = await getUserEmail(email);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, role, address, avatar, status } = req.body;
    
    if (!id) {
      res.status(404).json({ error: "User ID is required" });
      return;
    }
    
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const requestRole = extractUserRole(token || "");
    
    // Check if email is being changed
    if (email) {
      // Validate email format
      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }
      
      // Check if email is already in use by another user
      const existingUser = await getUserEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        res.status(400).json({ error: "Email already in use" });
        return;
      }
    }
    
    const newUser = await updateUserData(
      parseInt(id),
      fullname,
      requestRole === "Admin" ? role : "User",
      address,
      avatar,
      status,
      email
    );
    
    if (!newUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    res.json({ user: newUser, success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateAvatar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    
    if (!avatar) {
      res.status(400).json({ error: "Avatar is required" });
      return;
    }
    
    const user = await updateUserAvatar(parseInt(id), avatar);
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      res.status(400).json({ error: "New password is required" });
      return;
    }
    
    // Password length validation
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }
    
    try {
      // Check if we have admin override
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      const requestRole = extractUserRole(token || "");
      
      // If admin is resetting password, no need for current password verification
      if (requestRole === "Admin" && !currentPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await adminResetPassword(parseInt(id), hashedPassword);
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }
        res.json({ success: true, message: "Password updated successfully" });
        return;
      }
      
      // Otherwise, require current password
      if (!currentPassword) {
        res.status(400).json({ error: "Current password is required" });
        return;
      }
      
      const user = await updateUserPassword(parseInt(id), currentPassword, newPassword);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      if (err instanceof Error) {
        res.status(401).json({ error: err.message });
      } else {
        res.status(400).json({ error: "Failed to update password" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};

export const suspendUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    let { reason, expiryDate } = req.body;
    
    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }
    
    // Limit suspension reason to 20 characters
    if (reason && reason.length > 20) {
      reason = reason.substring(0, 20);
    }
    
    const user = await updateUserStatus(
      parseInt(id),
      'suspended',
      reason || 'Suspended by admin',
      expiryDate ? new Date(expiryDate) : undefined
    );
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    res.json({ user, success: true, message: "User suspended successfully" });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const activateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }
    
    const user = await updateUserStatus(
      parseInt(id),
      'active'
    );
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    res.json({ user, success: true, message: "User activated successfully" });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    
    // Get the user to verify it exists
    const userId = parseInt(id);
    const user = await getUserId(userId);
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    
    // Set up the database connection
    const db = AppDataSource.manager;
    
    try {
      // Start a transaction
      await AppDataSource.transaction(async transactionalEntityManager => {
        // Get all orders for this user first
        const orders = await transactionalEntityManager
          .createQueryBuilder()
          .select("id")
          .from(Order, "order")
          .where("userId = :id", { id: userId })
          .getRawMany();
          
        const orderIds = orders.map(order => order.id);
        console.log(`Found ${orderIds.length} orders for user ${userId}`);
        
        if (orderIds.length > 0) {
          // Delete order items for all user's orders
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(OrderItem)
            .where("orderId IN (:...orderIds)", { orderIds })
            .execute();
          console.log(`Deleted order items for orders: ${orderIds.join(', ')}`);
          
          // Delete the orders
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(Order)
            .where("userId = :id", { id: userId })
            .execute();
          console.log(`Deleted orders for user ${userId}`);
        }
        
        // 1. Delete refresh tokens
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from("RefreshTokens")
          .where("userId = :id", { id: userId })
          .execute();
        console.log(`Deleted refresh tokens for user ${userId}`);
        
        // 2. Delete messages
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from("Messages")
          .where("senderId = :id", { id: userId })
          .execute();
        console.log(`Deleted sent messages for user ${userId}`);
          
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from("Messages")
          .where("receiverId = :id", { id: userId })
          .execute();
        console.log(`Deleted received messages for user ${userId}`);
          
        // 3. Finally delete the user
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from("Users")
          .where("id = :id", { id: userId })
          .execute();
        console.log(`Deleted user ${userId}`);
      });
      
      res.json({ deleted: true, message: "Account deleted successfully" });
    } catch (txError) {
      console.error("Transaction error:", txError);
      res.status(500).json({ error: "Failed to delete user account" });
    }
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    res.status(500).json({ error: "Internal server error during account deletion" });
  }
};
