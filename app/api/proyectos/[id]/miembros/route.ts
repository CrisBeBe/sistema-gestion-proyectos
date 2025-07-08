import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { ProjectMember } from "@/types"

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
      SELECT pm.*, u.nombre, u.email
      FROM proyecto_miembros pm
      JOIN usuarios u ON pm.usuario_id = u.id
      WHERE pm.proyecto_id = ?
      ORDER BY pm.fecha_union ASC
    `,
      [projectId],
    )

    return NextResponse.json(ok(rows as ProjectMember[]))
  } catch (error) {
    console.error("Error obteniendo miembros del proyecto:", error)
    return internalServerError()
  }
}
