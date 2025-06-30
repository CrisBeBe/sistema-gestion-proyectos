import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
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

    const proyectoId = parseInt(id);

    // Verificar acceso al proyecto
    const [access] = await db.execute(
      `
      SELECT 1 FROM proyectos p
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.id = ? AND (p.creador_id = ? OR up.usuario_id = ?)
    `,
      [proyectoId, user.id, user.id]
    );

    if ((access as any[]).length === 0) {
      return createErrorResponse("No tienes acceso a este proyecto", 403);
    }

    // Obtener detalles del proyecto
    const [proyecto] = await db.execute(
      `
      SELECT p.*
      FROM proyectos p
      WHERE p.id = ?
    `,
      [proyectoId]
    );

    // Obtener miembros del proyecto
    const [miembros] = await db.execute(
      `
      SELECT u.id, u.nombre, u.email, up.fecha_union
      FROM usuarios u
      JOIN usuario_proyecto up ON u.id = up.usuario_id
      WHERE up.proyecto_id = ?
    `,
      [proyectoId]
    );

    const [tareas] = await db.execute(
      "select * from tareas where proyecto_id = ?",
      [proyectoId]
    );

    return createResponse({
      proyecto: (proyecto as any[])[0],
      miembros,
      tareas,
    });
  } catch (error) {
    console.error("Error al obtener proyecto:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = authenticateUser(req);
    if (!userId) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const proyectoId = parseInt(params.id);
    const { titulo, descripcion } = await req.json();

    // Verificar que el usuario es el creador
    const [proyecto] = await db.execute(
      "SELECT creador_id FROM proyectos WHERE id = ?",
      [proyectoId]
    );

    if ((proyecto as any[]).length === 0) {
      return createErrorResponse("Proyecto no encontrado", 404);
    }

    if ((proyecto as any[])[0].creador_id !== userId) {
      return createErrorResponse(
        "Solo el creador puede editar el proyecto",
        403
      );
    }

    if (!titulo) {
      return createErrorResponse("El título es requerido", 400);
    }

    await db.execute(
      "UPDATE proyectos SET titulo = ?, descripcion = ? WHERE id = ?",
      [titulo, descripcion || null, proyectoId]
    );

    return createResponse({ message: "Proyecto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const proyectoId = parseInt((await params).id);

    // Verificar que el usuario es el creador
    const [proyecto] = await db.execute(
      "SELECT creador_id FROM proyectos WHERE id = ?",
      [proyectoId]
    );

    if ((proyecto as any[]).length === 0) {
      return createErrorResponse("Proyecto no encontrado", 404);
    }

    if ((proyecto as any[])[0].creador_id !== user.id) {
      return createErrorResponse(
        "Solo el creador puede eliminar el proyecto",
        403
      );
    }

    await db.execute("DELETE FROM proyectos WHERE id = ?", [proyectoId]);

    return createResponse({ message: "Proyecto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
