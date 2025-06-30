import { generateToken, hashPassword } from "@/lib/auth";
import db from "@/lib/database";
import { createErrorResponse, createResponse } from "@/lib/middleware";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password } = await req.json();

    if (!nombre || !email || !password) {
      return createErrorResponse("Todos los campos son requeridos", 400);
    }

    // Verificar si el email ya existe
    const [existingUser] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if ((existingUser as any[]).length > 0) {
      return createErrorResponse("El email ya está registrado", 409);
    }

    // Crear usuario
    const passwordHash = await hashPassword(password);
    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
      [nombre, email, passwordHash]
    );

    const userId = (result as any).insertId;
    const token = generateToken({ id: userId, email, nombre });

    return createResponse(
      {
        message: "Usuario creado exitosamente",
        usuario: { id: userId, nombre, email },
        token,
      },
      201
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
