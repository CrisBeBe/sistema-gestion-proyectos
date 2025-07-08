import { JWT_SECRET } from "@/config";
import { UserPayload } from "@/types";
import jwt from "jsonwebtoken";

const SECRET_KEY = JWT_SECRET;

// Generar un JWT
export function signToken(payload: UserPayload) {
  return jwt.sign(payload, SECRET_KEY);
}

// Verificar un JWT
export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, SECRET_KEY) as UserPayload;
}
