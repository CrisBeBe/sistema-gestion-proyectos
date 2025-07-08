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

    const projectId = Number.parseInt(params.id)
    const fileId = Number.parseInt(params.fileId)

    // Check if user is project creator
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [projectId])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador puede eliminar archivos del proyecto", 403)
    }

    // Get file info
    const [fileRows] = await db.execute("SELECT * FROM proyecto_archivos WHERE id = ? AND proyecto_id = ?", [
      fileId,
      projectId,
    ])

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
    await db.execute("DELETE FROM proyecto_archivos WHERE id = ?", [fileId])

    return NextResponse.json(ok({ message: "Archivo eliminado correctamente" }))
  } catch (error) {
    console.error("Error eliminando archivo:", error)
    return internalServerError()
  }
}
