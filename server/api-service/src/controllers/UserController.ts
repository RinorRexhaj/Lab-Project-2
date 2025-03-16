import { RequestHandler } from "express";
import {
  deleteUserId,
  getAllUsers,
  getUserEmail,
  getUserId,
  updateUserData,
} from "../services/UserService";
import { isValidEmail } from "./AuthController";

export const getUsers: RequestHandler = async (req, res): Promise<void> => {
  const users = await getAllUsers();
  res.json({ users });
};

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
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
    const { id, fullname, role, address } = req.body;
    if (!id || !fullname || !role) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const user = await getUserId(id);
    const newUser = await updateUserData(
      id,
      fullname,
      user?.Role === "Admin" ? role : "User",
      address
    );
    res.json({ user: newUser });
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(404).json({ error: "Id not found" });
      return;
    }
    const deleted = await deleteUserId(id);
    res.json({ deleted });
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
  }
};
