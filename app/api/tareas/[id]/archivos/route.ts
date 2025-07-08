import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

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
      [taskId, decoded.id, taskId, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a esta tarea", 403)
    }

    const [rows] = await db.execute(
      `
      SELECT tf.*, u.nombre as subido_por_nombre
      FROM tarea_archivos tf
      JOIN usuarios u ON tf.subido_por = u.id
      WHERE tf.tarea_id = ?
      ORDER BY tf.fecha_subida DESC
    `,
      [taskId],
    )

    return NextResponse.json(ok(rows))
  } catch (error) {
    console.error("Error obteniendo archivos de la tarea:", error)
    return internalServerError()
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if user is project creator (only creator can upload task files)
    const [creatorCheck] = await db.execute(
      `
      SELECT p.creador_id
      FROM tareas t
      JOIN proyectos p ON t.proyecto_id = p.id
      WHERE t.id = ?
    `,
      [taskId],
    )

    const task = (creatorCheck as any[])[0]
    if (!task) {
      return err("Tarea no encontrada", 404)
    }

    if (task.creador_id !== decoded.id) {
      return err("Solo el creador del proyecto puede subir archivos a las tareas", 403)
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return err("No se proporcionó ningún archivo", 400)
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "tasks", taskId.toString())
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFilename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save file info to database
    const [result] = await db.execute(
      `
      INSERT INTO tarea_archivos (tarea_id, nombre_archivo, nombre_original, tipo_archivo, tamaño, ruta_archivo, subido_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [taskId, uniqueFilename, file.name, file.type, file.size, filePath, decoded.id],
    )

    const fileId = (result as any).insertId

    return NextResponse.json(
      ok({
        id: fileId,
        nombre_archivo: uniqueFilename,
        nombre_original: file.name,
        tipo_archivo: file.type,
        tamaño: file.size,
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("Error subiendo archivo:", error)
    return internalServerError()
  }
}
