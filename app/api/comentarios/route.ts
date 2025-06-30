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

    const { searchParams } = new URL(req.url);
    const tareaId = searchParams.get("id_tarea");

    if (!tareaId) {
      return createErrorResponse("id_tarea es requerido", 400);
    }

    // Verificar acceso a la tarea
    const [access] = await db.execute(
      `
      SELECT 1 FROM tareas t
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE t.id = ? AND (p.creador_id = ? OR up.usuario_id = ?)
    `,
      [tareaId, user.id, user.id]
    );

    if ((access as any[]).length === 0) {
      return createErrorResponse("No tienes acceso a esta tarea", 403);
    }

    const [resultado] = await db.execute(
      `
      SELECT *
      FROM comentarios c
      WHERE c.tarea_id = ?
      ORDER BY c.fecha_creacion ASC
    `,
      [tareaId]
    );

    const comentarios: Commentary[] = new Array();

    for (let comment of resultado as Commentary[]) {
      const [users] = await db.execute(
        `
        SELECT u.*
        FROM comentarios c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ?
      `,
        [comment.id]
      );

      comentarios.push({ ...comment, user: (users as any)[0] });
    }

    return createResponse(comentarios);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const { contenido, tarea_id } = await req.json();

    if (!contenido || !tarea_id) {
      return createErrorResponse("Contenido y tarea_id son requeridos", 400);
    }

    // Verificar acceso a la tarea
    const [access] = await db.execute(
      `
      SELECT 1 FROM tareas t
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE t.id = ? AND (p.creador_id = ? OR up.usuario_id = ?)
    `,
      [tarea_id, user.id, user.id]
    );

    if ((access as any[]).length === 0) {
      return createErrorResponse("No tienes acceso a esta tarea", 403);
    }

    const [result] = await db.execute(
      "INSERT INTO comentarios (contenido, usuario_id, tarea_id) VALUES (?, ?, ?)",
      [contenido, user.id, tarea_id]
    );

    const insertID = (result as any).insertId;

    const [comentarioCreado] = await db.execute(
      "select * from comentarios where id=?",
      [insertID]
    );
    const comentario = (comentarioCreado as Commentary[])[0];

    return createResponse({ ...comentario, user });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
