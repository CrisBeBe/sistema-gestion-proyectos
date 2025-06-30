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

    // Estadísticas generales
    const [stats] = await db.execute(
      `
      SELECT 
        (SELECT COUNT(*) FROM proyectos p 
         LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id 
         WHERE p.creador_id = ? OR up.usuario_id = ?) as total_proyectos,
        (SELECT COUNT(*) FROM tareas t 
         LEFT JOIN proyectos p ON t.proyecto_id = p.id 
         LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id 
         WHERE (p.creador_id = ? OR up.usuario_id = ?) AND t.estado = 'completada') as tareas_completadas
    `,
      [user.id, user.id, user.id, user.id, user.id, user.id, user.id, user.id]
    );

    // Tareas próximas a vencer
    const [tareasProximas] = await db.execute(
      `
      SELECT t.id, t.titulo, t.fecha_limite, p.titulo as proyecto_titulo
      FROM tareas t
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE (p.creador_id = ? OR up.usuario_id = ?) 
        AND t.estado != 'completada'
        AND t.fecha_limite IS NOT NULL
        AND t.fecha_limite >= NOW()
      ORDER BY t.fecha_limite ASC
      LIMIT 5
    `,
      [user.id, user.id]
    );

    // Proyectos recientes
    const [proyectosRecientes] = await db.execute(
      `
      SELECT DISTINCT p.id, p.titulo, p.fecha_actualizacion
      FROM proyectos p
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.creador_id = ? OR up.usuario_id = ?
      ORDER BY p.fecha_actualizacion DESC
      LIMIT 5
    `,
      [user.id, user.id]
    );

    // Actividad reciente (comentarios)
    const [actividadReciente] = await db.execute(
      `
      SELECT c.contenido, c.fecha_creacion, u.nombre as usuario_nombre, 
             t.titulo as tarea_titulo, p.titulo as proyecto_titulo
      FROM comentarios c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN tareas t ON c.tarea_id = t.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.creador_id = ? OR up.usuario_id = ?
      ORDER BY c.fecha_creacion DESC
      LIMIT 10
    `,
      [user.id, user.id]
    );

    return createResponse({
      estadisticas: (stats as any[])[0],
      tareas_proximas: tareasProximas,
      proyectos_recientes: proyectosRecientes,
      actividad_reciente: actividadReciente,
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
