import { comparePasswords, generateToken } from "@/lib/auth";
import db from "@/lib/database";
import { createErrorResponse, createResponse } from "@/lib/middleware";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return createErrorResponse("Email y contraseña son requeridos", 400);
    }

    // Buscar usuario
    const [users] = await db.execute(
      "SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?",
      [email]
    );

    const user = (users as any[])[0];
    if (!user) {
      return createErrorResponse("Credenciales inválidas", 401);
    }

    // Verificar contraseña
    const isValidPassword = await comparePasswords(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      return createErrorResponse("Credenciales inválidas", 401);
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    return createResponse({
      message: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error al hacer login:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
