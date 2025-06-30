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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return createErrorResponse(
        "Query de búsqueda debe tener al menos 2 caracteres",
        400
      );
    }

    const [usuarios] = await db.execute(
      `
      SELECT id, nombre, email
      FROM usuarios
      WHERE (nombre LIKE ? OR email LIKE ?) AND id != ?
      LIMIT 20
    `,
      [`%${query}%`, `%${query}%`, userId]
    );

    return createResponse({ usuarios });
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
