import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import { unlink } from "fs/promises"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; fileId: string } }) {
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
    const fileId = Number.parseInt(params.fileId)

    // Check if user can delete this file (project creator or assigned user)
    const [accessCheck] = await db.execute(
      `
      SELECT p.creador_id, ta.usuario_id as asignado_id
      FROM tarea_archivos tf
      JOIN tareas t ON tf.tarea_id = t.id
      JOIN proyectos p ON t.proyecto_id = p.id
      LEFT JOIN tarea_asignaciones ta ON t.id = ta.tarea_id AND ta.usuario_id = ?
      WHERE tf.id = ? AND tf.tarea_id = ?
    `,
      [decoded.id, fileId, taskId],
    )

    const access = (accessCheck as any[])[0]
    if (!access) {
      return err("Archivo no encontrado", 404)
    }

    if (access.creador_id !== decoded.id && !access.asignado_id) {
      return err("No tienes permisos para eliminar este archivo", 403)
    }

    // Get file info
    const [fileRows] = await db.execute("SELECT * FROM tarea_archivos WHERE id = ? AND tarea_id = ?", [fileId, taskId])

    const file = (fileRows as any[])[0]
    if (!file) {
      return err("Archivo no encontrado", 404)
    }

    // Delete file from filesystem
    try {
      await unlink(file.ruta_archivo)
    } catch (fsError) {
      console.error("Error eliminando archivo del sistema:", fsError)
    }

    // Delete file record from database
    await db.execute("DELETE FROM tarea_archivos WHERE id = ?", [fileId])

    return NextResponse.json(ok({ message: "Archivo eliminado correctamente" }))
  } catch (error) {
    console.error("Error eliminando archivo:", error)
    return internalServerError()
  }
}
