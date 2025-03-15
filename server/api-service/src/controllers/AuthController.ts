import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepo } from "../repositories/UserRepo";
import { TokenRepo } from "../repositories/TokenRepo";
import { User } from "../types/User";
import { error } from "console";
import { extractUserId, validToken } from "../services/TokenService";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH = process.env.JWT_REFRESH as string;

if (!JWT_SECRET || !JWT_REFRESH) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH must be defined in environment variables"
  );
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !isValidEmail(email) || password.length < 8) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = await UserRepo.findByEmail(email);
  if (!user) {
    res.status(404).json({ error: "User doesn't exist!" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.Password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { token, refreshToken } = await generateTokens(user);

  res.json({
    user: {
      id: user.ID,
      fullname: user.FullName,
      email: user.Email,
      role: user.Role,
      address: user.Address,
    },
    token,
    refreshToken,
  });
};

export const register: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullname, email, password, address } = req.body;
  if (!fullname || !email || !isValidEmail(email) || password.length < 8) {
    res.status(401).json({ error: "Invalid parameters" });
    return;
  }

  const existingUser = await UserRepo.findByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: "User already exists!" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UserRepo.createUser({
    FullName: fullname,
    Email: email,
    Password: hashedPassword,
    Role: "User",
    Address: address,
  });
  const newUser = await UserRepo.findByEmail(email);

  if (!newUser) {
    res.status(404).json({ error: "User wasn't registered" });
    return;
  }
  const { token, refreshToken } = await generateTokens(newUser);

  res.json({
    message: `User ${fullname} registered successfully`,
    token,
    refreshToken,
  });
};

export const getUsers: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const users = await UserRepo.getUsers();
  res.json({ users });
};

export const refresh: RequestHandler = async (req: Request, res: Response) => {
  const { refresh } = req.body;
  if (!refresh) {
    res.status(404).send({ error: "Refresh token not found" });
    return;
  }

  const id = extractUserId(refresh, JWT_REFRESH);
  if (!id) {
    res.status(404).json({ error: "Invalid refresh" });
    return;
  }
  const user = await UserRepo.findById(id);
  if (!user) {
    res.status(404).json({ error: "User doesn't exist" });
    return;
  }
  const validRefresh = validToken(refresh, JWT_REFRESH);

  const { token, refreshToken } = await generateTokens(
    user,
    validRefresh ? refresh : ""
  );

  res.json({
    user: {
      id: user.ID,
      fullname: user.FullName,
      email: user.Email,
      role: user.Role,
      address: user.Address,
    },
    token,
    refreshToken,
  });
};

const generateTokens = async (user: User, refresh?: string) => {
  const token = jwt.sign(
    { id: user.ID, fullname: user.FullName, email: user.Email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  let refreshToken = await TokenRepo.findRefreshToken(user.ID || 0);

  if (
    !refresh ||
    !validToken(refresh, JWT_REFRESH) ||
    !refreshToken ||
    !validToken(refreshToken, JWT_REFRESH)
  ) {
    refreshToken = jwt.sign(
      { id: user.ID, fullname: user.FullName, email: user.Email },
      JWT_REFRESH,
      { expiresIn: "7d" }
    );
    await TokenRepo.storeRefreshToken(user.ID || 0, refreshToken);
  }

  return { token, refreshToken: refresh || refreshToken };
};
