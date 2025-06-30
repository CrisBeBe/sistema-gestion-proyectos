import { JWT_SECRET } from "@/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign({ ...user }, JWT_SECRET);
};

export const verifyToken = (token: string): User | null => {
  try {
    const response = jwt.verify(token, JWT_SECRET) as User;
    return response;
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeader = (
  authHeader: string | null
): string | null => {
  if (!authHeader) return null;
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};
