import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { Comment } from "@/types"

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

    const url = new URL(request.url)
    const tareaId = url.searchParams.get("tarea_id")

    if (!tareaId) {
      return err("ID de la tarea requerido", 400)
    }

    // Check if user has access to this task
    const [accessCheck] = await db.execute(
      `
      SELECT 1 FROM tarea_asignaciones ta
      WHERE ta.tarea_id = ? AND ta.usuario_id = ?
      UNION
      SELECT 1 FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ? AND p.creador_id = ?
    `,
      [tareaId, decoded.id, tareaId, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a esta tarea", 403)
    }

    const [rows] = await db.execute(
      `
      SELECT c.*, u.nombre as usuario_nombre
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.tarea_id = ?
      ORDER BY c.fecha_creacion ASC
    `,
      [tareaId],
    )

    return NextResponse.json(ok(rows as Comment[]))
  } catch (error) {
    console.error("Error obteniendo comentarios:", error)
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

    const { contenido, tarea_id } = await request.json()

    if (!contenido || !tarea_id) {
      return err("Contenido y tarea son requeridos", 400)
    }

    // Check if user has access to this task
    const [accessCheck] = await db.execute(
      `
      SELECT 1 FROM tarea_asignaciones ta
      WHERE ta.tarea_id = ? AND ta.usuario_id = ?
      UNION
      SELECT 1 FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ? AND p.creador_id = ?
    `,
      [tarea_id, decoded.id, tarea_id, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a esta tarea", 403)
    }

    const [result] = await db.execute("INSERT INTO comentarios (contenido, tarea_id, usuario_id) VALUES (?, ?, ?)", [
      contenido,
      tarea_id,
      decoded.id,
    ])

    const commentId = (result as any).insertId

    return NextResponse.json(
      ok({
        id: commentId,
        contenido,
        tarea_id,
        usuario_id: decoded.id,
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando comentario:", error)
    return internalServerError()
  }
}
