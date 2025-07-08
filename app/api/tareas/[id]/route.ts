import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { Task, TaskAssignment, Comment } from "@/types"
import {getTokenFromHeader} from "@/lib/auth"
import { getProjectTasks } from "../../proyectos/route"

export interface Params {
  params: Promise<{id: string}>
}
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const taskId = Number.parseInt(params.id)

    // Get task details
    const [taskRows] = await db.execute(
      `
      SELECT t.*, u.nombre as creador_nombre, p.creador_id as proyecto_creador_id
      FROM tareas t
      LEFT JOIN usuarios u ON t.creador_id = u.id
      LEFT JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ?
    `,
      [taskId],
    )

    const task = (taskRows as Task[])[0]
    if (!task) {
      return err("Tarea no encontrada", 404)
    }

    // Check if user has access to this task
    const [accessCheck] = await db.execute(
      `
      SELECT 1 FROM tarea_asignaciones ta
      WHERE ta.tarea_id = ? AND ta.usuario_id = ?
      UNION
      SELECT 1 FROM proyectos p
      WHERE p.id = ? AND p.creador_id = ?
    `,
      [taskId, decoded.id, (task as any).proyecto_id, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a esta tarea", 403)
    }

    // Get task assignments
    const [assignmentRows] = await db.execute(
      `
      SELECT ta.*, u.nombre, u.email
      FROM tarea_asignaciones ta
      JOIN usuarios u ON ta.usuario_id = u.id
      WHERE ta.tarea_id = ?
    `,
      [taskId],
    )

    // Get task files
    const [fileRows] = await db.execute(
      `
      SELECT tf.*, u.nombre as subido_por_nombre
      FROM tarea_archivos tf
      JOIN usuarios u ON tf.subido_por = u.id
      WHERE tf.tarea_id = ?
      ORDER BY tf.fecha_subida DESC
    `,
      [taskId],
    )

    // Get comments
    const [commentRows] = await db.execute(
      `
      SELECT c.*, u.nombre as usuario_nombre
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.tarea_id = ?
      ORDER BY c.fecha_creacion ASC
    `,
      [taskId],
    )

    const taskWithDetails = {
      ...task,
      asignados: assignmentRows as TaskAssignment[],
      archivos: fileRows,
      comentarios: commentRows as Comment[],
    }

    return NextResponse.json(ok(taskWithDetails))
  } catch (error) {
    console.error("Error obteniendo tarea:", error)
    return internalServerError()
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const {id} = await params;
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const taskId = Number.parseInt(id)
    const { estado } = await request.json()

    // Check if user has access to modify this task
    const [accessCheck] = await db.execute(
      `
      SELECT p.creador_id, t.creador_id as tarea_creador_id
      FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN tarea_asignaciones ta ON t.id = ta.tarea_id
      WHERE t.id = ? AND (p.creador_id = ? OR ta.usuario_id = ?)
    `,
      [taskId, decoded.id, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso para modificar esta tarea", 403)
    }

    await db.execute(
      "UPDATE tareas SET estado = ? WHERE id = ?",
      [estado, taskId],
    )

    const [pRS] = await db.execute("select proyecto_id from tareas where id=?", [taskId]);
    const p = (pRS as any[])[0]
    
    const tareas = (await getProjectTasks(p.proyecto_id)).filter(t => t.creador_id === decoded.id || t.asignados.some(a => a.usuario_id === decoded.id));

    return ok(tareas)
  } catch (error) {
    console.error("Error actualizando tarea:", error)
    return internalServerError()
  }
}


export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const {id} = await params;
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const user = verifyToken(token)
    if (!user) {
      return err("Token inválido", 401)
    }

    const taskId = Number.parseInt(id)

    // Check if user is project creator (only creator can delete tasks)
    const [creatorCheck] = await db.execute(
      `
      SELECT *
      FROM tareas 
      WHERE id=? and creador_id=?
    `,
      [taskId, user.id],
    )

    const task = (creatorCheck as any[])[0]
    if (!task) {
      return err("Tarea no encontrada", 404)
    }

    if (task.creador_id !== user.id) {
      return err("Solo el creador del proyecto puede eliminar tareas", 403)
    }

    await db.execute("DELETE FROM tareas WHERE id = ?", [taskId])

    return ok({ message: "Tarea eliminada correctamente" })
  } catch (error) {
    console.error("Error eliminando tarea:", error)
    return internalServerError()
  }
}
