import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/database"
import { ok, err, internalServerError } from "@/lib/utils"
import { generateToken } from "@/lib/auth"
import { APIResponse, UserPayload } from "@/types"

export interface RegisterResponse {
  user: UserPayload;
  token: string;
}

export async function POST(request: NextRequest): APIResponse<RegisterResponse> {
  try {
    const { nombre, email, password } = await request.json()

    if (!nombre || !email || !password) {
      return err("Todos los campos son requeridos", 400)
    }

    if (password.length < 6) {
      return err("La contraseña debe tener al menos 6 caracteres", 400)
    }

    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT id FROM usuarios WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      return err("El email ya está registrado", 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.execute("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)", [
      nombre,
      email,
      hashedPassword,
    ])

    const userId = (result as any).insertId
    const token = generateToken({ id: userId, email, nombre })

    return ok({
        user: { id: userId, nombre, email },
        token,
      })
  } catch (error) {
    console.error("Error en registro:", error)
    return internalServerError()
  }
}
