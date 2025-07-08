import { JWT_SECRET } from "@/config";
import { User, UserPayload } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signToken } from "./jwt";
import { NextRequest } from "next/server";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user: UserPayload): string => {
  return signToken(user);
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    const response = jwt.verify(token, JWT_SECRET) as UserPayload;
    return response;
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeader = (
  req: NextRequest
): string | null => {
  const token = req.headers.get("authorization");
  if (!token) return null;
  return token.startsWith("Bearer ") ? token.slice(7) : null;
};
