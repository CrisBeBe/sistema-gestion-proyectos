import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const user = authenticateUser(req);

    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const proyectoId = parseInt(id);

    const [miembros] = await db.execute(
      "SELECT u.* from usuarios u inner join usuario_proyecto up on up.usuario_id = u.id where up.proyecto_id = ? order by up.fecha_union ASC;",
      [proyectoId]
    );

    return createResponse(miembros, 200);
  } catch (error) {
    console.error("Error al obtener miembros:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token inválido o expirado", 401);
    }

    const proyectoId = parseInt(id);
    const { email } = await req.json();

    if (!email) {
      return createErrorResponse("Email es requerido", 400);
    }

    // Verificar que el usuario es el creador del proyecto
    const [access] = await db.execute(
      `
      SELECT 1 FROM proyectos p
      LEFT JOIN usuario_proyecto up ON p.id = up.proyecto_id
      WHERE p.id = ? AND p.creador_id = ?;
    `,
      [proyectoId, user.id]
    );

    if ((access as any[]).length === 0) {
      return createErrorResponse("No tienes acceso a este proyecto", 403);
    }

    // Buscar usuario por email
    const [usuario] = await db.execute(
      "SELECT id, nombre, email FROM usuarios WHERE email = ?",
      [email]
    );

    if ((usuario as any[]).length === 0) {
      return createErrorResponse("Usuario no encontrado", 404);
    }

    const nuevoMiembro = (usuario as User[])[0];

    // Verificar si ya es miembro
    const [existingMember] = await db.execute(
      "SELECT 1 FROM usuario_proyecto WHERE usuario_id = ? AND proyecto_id = ?",
      [nuevoMiembro.id, proyectoId]
    );

    if ((existingMember as any[]).length > 0) {
      return createErrorResponse("El usuario ya es miembro del proyecto", 409);
    }

    // Agregar miembro
    await db.execute(
      "INSERT INTO usuario_proyecto (usuario_id, proyecto_id) VALUES (?, ?)",
      [nuevoMiembro.id, proyectoId]
    );

    return createResponse(
      {
        message: "Miembro agregado exitosamente",
        miembro: (usuario as any[])[0],
      },
      201
    );
  } catch (error) {
    console.error("Error al agregar miembro:", error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
