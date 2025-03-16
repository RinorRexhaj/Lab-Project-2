import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const { id } = req.body;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied" });
    return;
  }

  if (id !== extractUserId(token) && extractUserRole(token) !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    next();
  });
};

export const validToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const extractUserId = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as { id: number } | null;
    return decoded?.id || 0;
  } catch {
    return 0;
  }
};

export const extractUserRole = (token: string) => {
  try {
    const decoded = jwt.decode(token) as { role: "User" | "Admin" } | null;
    return decoded?.role || 0;
  } catch {
    return 0;
  }
};
