import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'avatar', 'project', 'task', 'comment'

    if (!file) {
      return err("No se proporcionó ningún archivo", 400)
    }

    if (!type) {
      return err("Tipo de archivo requerido", 400)
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return err("El archivo es demasiado grande (máximo 10MB)", 400)
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "uploads", type)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, uniqueFilename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return NextResponse.json(
      ok({
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/${type}/${uniqueFilename}`,
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("Error subiendo archivo:", error)
    return internalServerError()
  }
}
