import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { Task } from "@/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const [tareas] = await db.execute(
      `
      SELECT t.*
      FROM tareas t
      INNER JOIN proyectos p ON t.proyecto_id = p.id
      INNER JOIN usuario_proyecto up ON up.proyecto_id = p.id
      WHERE up.usuario_id = ?
      ORDER BY t.fecha_creacion DESC
    `,
      [user.id]
    );

    return createResponse(tareas);
  } catch (error) {
    console.error("Error al obtener tareas:", error);

    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const {
      titulo,
      descripcion,
      prioridad,
      fecha_limite,
      proyecto_id,
      asignar_a,
    } = await req.json();

    if (!titulo || !proyecto_id) {
      return createErrorResponse("Título y proyecto_id son requeridos", 400);
    }

    // Verificar acceso al proyecto
    const [access] = await db.execute(
      `
      SELECT 1 FROM proyectos p
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.id = ? AND (p.creador_id = ? OR up.usuario_id = ?)
    `,
      [proyecto_id, user.id, user.id]
    );

    if ((access as any[]).length === 0) {
      return createErrorResponse("No tienes acceso a este proyecto", 403);
    }

    // Crear tarea
    const [result] = await db.execute(
      "INSERT INTO tareas (titulo, descripcion, prioridad, fecha_limite, proyecto_id, creador_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        titulo,
        descripcion || null,
        prioridad || null,
        fecha_limite || null,
        proyecto_id,
        user.id,
      ]
    );

    const tareaId = (result as any).insertId;

    for (let miembro of asignar_a) {
      await db.execute(
        "insert into usuario_tarea(usuario_id, tarea_id) values(?, ?)",
        [miembro, tareaId]
      );
    }

    const [nuevaTarea] = await db.execute("select * from tareas where id = ?", [
      tareaId,
    ]);

    return createResponse((nuevaTarea as Task[])[0], 201);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
