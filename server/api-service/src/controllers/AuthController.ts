import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepo } from "../repositories/UserRepo";
import { TokenRepo } from "../repositories/TokenRepo";
import { User } from "../models/User";
import { extractUserId, validToken } from "../services/TokenService";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH = process.env.JWT_REFRESH as string;

if (!JWT_SECRET || !JWT_REFRESH) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH must be defined in environment variables"
  );
}

export const isValidEmail = (email: string): boolean => {
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

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Only check for suspension when all other validations pass
  if (user.status === "suspended") {
    let message = "";

    // Check if there's an expiry date
    const hasExpiry =
      user.suspendExpiryDate && new Date(user.suspendExpiryDate) > new Date();

    // Check if expiry date is still in the future
    if (hasExpiry) {
      const expiryDate = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(user.suspendExpiryDate as Date));

      message = `You have been suspended until ${expiryDate}.`;
    } else {
      message = "You have been suspended indefinitely.";
    }

    // Add reason if one was provided
    if (user.suspendReason) {
      message += ` Reason: ${user.suspendReason.substring(0, 20)}`;
    }

    res.status(403).json({ error: message, suspended: true });
    return;
  }

  // Update last login time
  user.lastLogin = new Date();
  await UserRepo.updateLastLogin(user.id);

  const { token, refreshToken } = await generateTokens(user);

  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      address: user.address,
      avatar: user.avatar,
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
    fullName: fullname,
    email: email,
    password: hashedPassword,
    role: "User",
    address: address,
  });
  const newUser = await UserRepo.findByEmail(email);

  if (!newUser) {
    res.status(404).json({ error: "User wasn't registered" });
    return;
  }
  const { token, refreshToken } = await generateTokens(newUser);

  res.json({
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      address: newUser.address,
      avatar: newUser.avatar,
    },
    token,
    refreshToken,
  });
};

export const refresh: RequestHandler = async (req: Request, res: Response) => {
  const { refresh } = req.body;
  if (!refresh) {
    res.status(404).send({ error: "Refresh token not found" });
    return;
  }

  const id = extractUserId(refresh);
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
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      address: user.address,
      avatar: user.avatar,
    },
    token,
    refreshToken,
  });
};

const generateTokens = async (user: User, refresh?: string) => {
  const token = jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  let refreshToken = await TokenRepo.findRefreshToken(user.id || 0);

  if (
    !refresh ||
    !validToken(refresh, JWT_REFRESH) ||
    !refreshToken ||
    !validToken(refreshToken, JWT_REFRESH)
  ) {
    refreshToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_REFRESH,
      { expiresIn: "7d" }
    );
    await TokenRepo.storeRefreshToken(user.id || 0, refreshToken);
  }

  return { token, refreshToken: refresh || refreshToken };
};
