import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { APIResponse, Task } from "@/types"
import { getTokenFromHeader } from "@/lib/auth"

export async function GET(request: NextRequest): APIResponse<Task[]> {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }


    // If user is creator, show all tasks. If collaborator, show only assigned tasks
    let query = `
      SELECT t.*, u.nombre as creador_nombre
      FROM tareas t
      LEFT JOIN usuarios u ON t.creador_id = u.id
      WHERE t.proyecto_id = ?
    `

    if (project.creador_id !== decoded.id) {
      query += ` AND t.id IN (
        SELECT ta.tarea_id FROM tarea_asignaciones ta WHERE ta.usuario_id = ?
      )`
    }

    query += ` ORDER BY t.fecha_creacion DESC`

    const queryParams = project.creador_id !== decoded.id ? [proyectoId, decoded.id] : [proyectoId]

    const [rows] = await db.execute(query, queryParams)

    return ok(rows as Task[])
  } catch (error) {
    console.error("Error obteniendo tareas:", error)
    return internalServerError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const { titulo, descripcion, proyecto_id, fecha_limite, prioridad, asignados } = await request.json()

    if (!titulo || !proyecto_id) {
      return err("Título y proyecto son requeridos", 400)
    }

    // Check if user is project creator (only creator can create tasks)
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [proyecto_id])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador del proyecto puede crear tareas", 403)
    }

    const [result] = await db.execute(
      "INSERT INTO tareas (titulo, descripcion, proyecto_id, creador_id, fecha_limite, prioridad) VALUES (?, ?, ?, ?, ?, ?)",
      [titulo, descripcion, proyecto_id, decoded.id, fecha_limite || null, prioridad || "media"],
    )

    const taskId = (result as any).insertId

    // Assign users to task
    if (asignados && asignados.length > 0) {
      for (const usuarioId of asignados) {
        await db.execute("INSERT INTO tarea_asignaciones (tarea_id, usuario_id) VALUES (?, ?)", [taskId, usuarioId])
      }
    }

    return NextResponse.json(
      ok({
        id: taskId,
        titulo,
        descripcion,
        proyecto_id,
        fecha_limite,
        prioridad,
        asignados,
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando tarea:", error)
    return internalServerError()
  }
}
