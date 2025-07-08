import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { DashboardStats } from "@/types"
import { getTokenFromHeader } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    // Get total projects
    const [totalProjectsRows] = await db.execute(
      `
      SELECT COUNT(DISTINCT p.id) as total
      FROM proyectos p
      LEFT JOIN proyecto_miembros pm ON p.id = pm.proyecto_id
      WHERE p.creador_id = ? OR pm.usuario_id = ?
    `,
      [decoded.id, decoded.id],
    )

    const totalProyectos = (totalProjectsRows as any[])[0].total

    // Get active projects
    const [activeProjectsRows] = await db.execute(
      `
      SELECT COUNT(DISTINCT p.id) as total
      FROM proyectos p
      LEFT JOIN proyecto_miembros pm ON p.id = pm.proyecto_id
      WHERE (p.creador_id = ? OR pm.usuario_id = ?) AND p.estado = 'activo'
    `,
      [decoded.id, decoded.id],
    )

    const proyectosActivos = (activeProjectsRows as any[])[0].total

    // Get assigned tasks
    const [assignedTasksRows] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM tarea_asignaciones ta
      JOIN tareas t ON ta.tarea_id = t.id
      WHERE ta.usuario_id = ? AND t.estado != 'completada'
    `,
      [decoded.id],
    )

    const tareasAsignadas = (assignedTasksRows as any[])[0].total

    // Get completed tasks
    const [completedTasksRows] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM tarea_asignaciones ta
      JOIN tareas t ON ta.tarea_id = t.id
      WHERE ta.usuario_id = ? AND t.estado = 'completada'
    `,
      [decoded.id],
    )

    const tareasCompletadas = (completedTasksRows as any[])[0].total

    // Get recent projects
    const [recentProjectsRows] = await db.execute(
      `
      SELECT DISTINCT p.*, u.nombre as creador_nombre
      FROM proyectos p
      LEFT JOIN usuarios u ON p.creador_id = u.id
      LEFT JOIN proyecto_miembros pm ON p.id = pm.proyecto_id
      WHERE p.creador_id = ? OR pm.usuario_id = ?
      ORDER BY p.fecha_creacion DESC
      LIMIT 5
    `,
      [decoded.id, decoded.id],
    )

    // Get recent tasks
    const [recentTasksRows] = await db.execute(
      `
      SELECT t.*, p.nombre as proyecto_nombre
      FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN tarea_asignaciones ta ON t.id = ta.tarea_id
      WHERE ta.usuario_id = ? OR p.creador_id = ?
      ORDER BY t.fecha_creacion DESC
      LIMIT 5
    `,
      [decoded.id, decoded.id],
    )

    const stats: DashboardStats = {
      totalProyectos,
      proyectosActivos,
      tareasAsignadas,
      tareasCompletadas,
      proyectosRecientes: recentProjectsRows as any[],
      tareasRecientes: recentTasksRows as any[],
    }

    return NextResponse.json(ok(stats))
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error)
    return internalServerError()
  }
}
