import { Request, Response } from "express";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    res.json({ message: "Login successful", token: "fake-jwt-token" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const register = (req: Request, res: Response) => {
  const { username, password } = req.body;
  res.json({ message: `User ${username} registered successfully` });
};
