import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import { getTokenFromHeader } from "@/lib/auth"


interface Params {
  params: Promise<{id: string}>
}
export async function POST(request: NextRequest, { params }: Params) {
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

    const projectId = Number.parseInt(id)
    const { email } = await request.json()

    if (!email) {
      return err("Email es requerido", 400)
    }

    // Check if user is project creator
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [projectId])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      console.log({creatorCheck});
      
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador puede invitar miembros", 403)
    }

    // Check if user exists
    const [userRows] = await db.execute("SELECT id FROM usuarios WHERE email = ?", [email])

    if ((userRows as any[]).length === 0) {
      return err("Usuario no encontrado", 404)
    }

    const userId = (userRows as any[])[0].id

    // Check if user is already a member
    const [memberCheck] = await db.execute(
      "SELECT id FROM proyecto_miembros WHERE proyecto_id = ? AND usuario_id = ?",
      [projectId, userId],
    )

    if ((memberCheck as any[]).length > 0) {
      return err("El usuario ya es miembro del proyecto", 409)
    }

    // Check if invitation already exists
    const [invitationCheck] = await db.execute(
      'SELECT id FROM invitaciones WHERE proyecto_id = ? AND email = ? AND estado = "pendiente"',
      [projectId, email],
    )

    if ((invitationCheck as any[]).length > 0) {
      return err("Ya existe una invitación pendiente", 409)
    }

    // Create invitation
    const [result] = await db.execute("INSERT INTO invitaciones (proyecto_id, email) VALUES (?, ?)", [projectId, email])

    const invitationId = (result as any).insertId

    return ok({
        id: invitationId,
        mensaje: "Invitación enviada correctamente",
      })
  } catch (error) {
    console.error("Error enviando invitación:", error)
    return internalServerError()
  }
}
