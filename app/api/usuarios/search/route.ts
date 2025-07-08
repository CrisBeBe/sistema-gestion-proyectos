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

    const url = new URL(request.url)
    const query = url.searchParams.get("q")

    if (!query || query.length < 2) {
      return err("La búsqueda debe tener al menos 2 caracteres", 400)
    }

    const [rows] = await db.execute(
      `
      SELECT id, nombre, email
      FROM usuarios
      WHERE (nombre LIKE ? OR email LIKE ?) AND id != ?
      LIMIT 10
    `,
      [`%${query}%`, `%${query}%`, decoded.id],
    )

    return NextResponse.json(ok(rows as User[]))
  } catch (error) {
    console.error("Error buscando usuarios:", error)
    return internalServerError()
  }
}
