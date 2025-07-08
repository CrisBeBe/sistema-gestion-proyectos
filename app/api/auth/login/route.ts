import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/database"
import { ok, err, internalServerError } from "@/lib/utils"
import type { APIResponse, User, UserPayload } from "@/types"
import { generateToken } from "@/lib/auth"

export interface LoginResponse {
  user: UserPayload
  token: string
}

export async function POST(request: NextRequest): APIResponse<LoginResponse> {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return err("Email y contraseña son requeridos", 400)
    }

    const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email])

    const users = rows as User[]
    if (users.length === 0) {
      return err("Credenciales inválidas", 401)
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password!)

    if (!isValidPassword) {
      return err("Credenciales inválidas", 401)
    }

    const token = generateToken({ id: user.id, email: user.email, nombre: user.nombre })

    return ok({
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email
        },
        token,
      })
  } catch (error) {
    console.error("Error en login:", error)
    return internalServerError()
  }
}
