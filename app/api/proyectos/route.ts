import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = authenticateUser(req);

    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const [proyectos] = await db.execute(
      `
      SELECT DISTINCT p.*
      FROM proyectos p
      LEFT JOIN usuarios u ON p.creador_id = u.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.creador_id = ? OR up.usuario_id = ?
      ORDER BY p.fecha_actualizacion DESC
    `,
      [user.id, user.id]
    );

    return createResponse(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateUser(req);

    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const { titulo, descripcion } = await req.json();

    if (!titulo) {
      return createErrorResponse("El título es requerido", 400);
    }

    const [result] = await db.execute(
      "INSERT INTO proyectos (titulo, descripcion, creador_id) VALUES (?, ?, ?)",
      [titulo, descripcion || null, user.id]
    );

    const proyectoId = (result as any).insertId;

    const [consultaProyectoCreado] = await db.execute(
      "select * from proyectos where id =?",
      [proyectoId]
    );

    // Agregar al creador como miembro del proyecto
    await db.execute(
      "INSERT INTO usuario_proyecto (usuario_id, proyecto_id) VALUES (?, ?)",
      [user.id, proyectoId]
    );

    return createResponse((consultaProyectoCreado as Project[])[0], 201);
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
