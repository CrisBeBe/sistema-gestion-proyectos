import { NextRequest } from "next/server";
import { getTokenFromHeader, verifyToken } from "./auth";

export const authenticateUser = (req: NextRequest): User | null => {
  const token = getTokenFromHeader(req.headers.get("authorization"));

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  return decoded;
};

export const createResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const createErrorResponse = (message: string, status: number = 400) => {
  return createResponse({ error: message }, status);
};
