import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const [users] = await db.execute(
      "SELECT id, nombre, email, fecha_creacion FROM usuarios WHERE id = ?",
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      return createErrorResponse("Usuario no encontrado", 404);
    }

    return createResponse({ usuario: user });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const { nombre, email } = await req.json();

    if (!nombre || !email) {
      return createErrorResponse("Nombre y email son requeridos", 400);
    }

    // Verificar si el email ya existe (excepto para el usuario actual)
    const [existingUser] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ? AND id != ?",
      [email, userId]
    );

    if ((existingUser as any[]).length > 0) {
      return createErrorResponse("El email ya está en uso", 409);
    }

    await db.execute("UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?", [
      nombre,
      email,
      userId,
    ]);

    return createResponse({ message: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
