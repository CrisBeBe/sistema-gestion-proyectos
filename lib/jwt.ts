import { JWT_SECRET } from "@/config";
import { UserRegisterPayload } from "@/types";
import jwt, { SignOptions } from "jsonwebtoken";

const SECRET_KEY = JWT_SECRET;

// Generar un JWT
export function signToken(payload: UserRegisterPayload, expiresIn = "1h") {
  const signOptions = {
    expiresIn,
  } as SignOptions;

  return jwt.sign(payload, SECRET_KEY, signOptions);
}

// Verificar un JWT
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET_KEY);
}
