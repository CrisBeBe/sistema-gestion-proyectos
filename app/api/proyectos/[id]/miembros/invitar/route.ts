import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: number }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = authenticateUser(req);

    if (!user) {
      return createErrorResponse("Token inválido o expirado");
    }

    const { email } = await req.json();

    const [consultaDestinatario] = await db.execute(
      "select id, nombre, email from usuarios where email=?",
      [email]
    );

    if (!(consultaDestinatario as User[])[0]) {
      return createErrorResponse("Destinatario no encontrado.");
    }

    const destinatario = (consultaDestinatario as User[])[0];

    await db.execute(
      "insert into invitaciones(destinatario_id, remitente_id, proyecto_id) values (?, ?, ?)",
      [destinatario.id, user.id, id]
    );

    return createResponse({ success: true }, 200);
  } catch (error) {
    console.error(error);
    return createErrorResponse("Error interno del servidor", 500);
  }
}
