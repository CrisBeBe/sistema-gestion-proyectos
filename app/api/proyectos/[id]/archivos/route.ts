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

    const projectId = Number.parseInt(params.id)

    // Check if user has access to this project
    const [accessCheck] = await db.execute(
      `
      SELECT 1 FROM proyectos p
      LEFT JOIN proyecto_miembros pm ON p.id = pm.proyecto_id
      WHERE p.id = ? AND (p.creador_id = ? OR pm.usuario_id = ?)
    `,
      [projectId, decoded.id, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a este proyecto", 403)
    }

    const [rows] = await db.execute(
      `
      SELECT pf.*, u.nombre as subido_por_nombre
      FROM proyecto_archivos pf
      JOIN usuarios u ON pf.subido_por = u.id
      WHERE pf.proyecto_id = ?
      ORDER BY pf.fecha_subida DESC
    `,
      [projectId],
    )

    return NextResponse.json(ok(rows))
  } catch (error) {
    console.error("Error obteniendo archivos del proyecto:", error)
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

    const projectId = Number.parseInt(params.id)

    // Check if user is project creator (only creator can upload project files)
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [projectId])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador puede subir archivos al proyecto", 403)
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return err("No se proporcionó ningún archivo", 400)
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "projects", projectId.toString())
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
      INSERT INTO proyecto_archivos (proyecto_id, nombre_archivo, nombre_original, tipo_archivo, tamaño, ruta_archivo, subido_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [projectId, uniqueFilename, file.name, file.type, file.size, filePath, decoded.id],
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
