import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { Project, Task } from "@/types";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const tareaId = parseInt(id);

    const [tarea] = await db.execute(
      `
      SELECT t.*
      FROM tareas t
      WHERE t.id = ?
    `,
      [tareaId]
    );

    if ((tarea as any[]).length === 0) {
      return createErrorResponse("Tarea no encontrada o sin acceso", 404);
    }

    // Obtener asignados
    const [asignados] = await db.execute(
      `
      SELECT u.id, u.nombre, u.email
      FROM usuarios u
      JOIN usuario_tarea ut ON u.id = ut.usuario_id
      WHERE ut.tarea_id = ?
    `,
      [tareaId]
    );

    const [proyecto] = await db.execute(
      "select p.* from proyectos p inner join tareas t on p.id = t.proyecto_id where t.id = ?",
      [tareaId]
    );

    return createResponse({
      tarea: (tarea as any[])[0],
      asignados,
      proyecto: (proyecto as Project[])[0],
    });
  } catch (error) {
    console.error("Error al obtener tarea:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const tareaId = parseInt(id);
    const updates: Partial<Task> = await req.json();

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

    const [valoresActuales] = await db.execute(
      "select * from tareas where id = ?",
      [tareaId]
    );
    const tareaActual = (valoresActuales as Task[])[0];
    const applyUpdates: Task = {
      ...tareaActual,
      ...updates,
    };
    const { titulo, descripcion, prioridad, estado, fecha_limite } =
      applyUpdates;

    await db.execute(
      "UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ?, estado = ?, fecha_limite = ? WHERE id = ?",
      [
        titulo,
        descripcion || null,
        prioridad || "media",
        estado || "pendiente",
        fecha_limite || null,
        tareaId,
      ]
    );

    return createResponse(applyUpdates);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const tareaId = parseInt(id);

    // Verificar que el usuario es el creador de la tarea
    const [tarea] = await db.execute(
      `
      SELECT t.creador_id FROM tareas t
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE t.id = ? AND (p.creador_id = ? OR up.usuario_id = ?)
    `,
      [tareaId, user.id, user.id]
    );

    if ((tarea as any[]).length === 0) {
      return createErrorResponse("Tarea no encontrada o sin acceso", 404);
    }

    if ((tarea as any[])[0].creador_id !== user.id) {
      return createErrorResponse(
        "Solo el creador puede eliminar la tarea",
        403
      );
    }

    await db.execute("DELETE FROM tareas WHERE id = ?", [tareaId]);

    return createResponse({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
