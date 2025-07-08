import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { User } from "@/types"

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

    const [rows] = await db.execute("SELECT id, nombre, email, fecha_creacion, avatar FROM usuarios WHERE id = ?", [
      decoded.id,
    ])

    const user = (rows as User[])[0]
    if (!user) {
      return err("Usuario no encontrado", 404)
    }

    return NextResponse.json(ok(user))
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    return internalServerError()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const { nombre, avatar } = await request.json()

    if (!nombre) {
      return err("El nombre es requerido", 400)
    }

    await db.execute("UPDATE usuarios SET nombre = ?, avatar = ? WHERE id = ?", [
      nombre,
      avatar || null,
      decoded.id,
    ])

    return NextResponse.json(ok({ message: "Perfil actualizado correctamente" }))
  } catch (error) {
    console.error("Error actualizando perfil:", error)
    return internalServerError()
  }
}
