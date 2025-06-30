import db from "@/lib/database";
import {
  authenticateUser,
  createErrorResponse,
  createResponse,
} from "@/lib/middleware";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token expirado o inválido.");
    }

    const [consultaInvitaciones] = await db.execute(
      "select * from invitaciones where destinatario_id=?",
      [user.id]
    );

    const invitaciones = consultaInvitaciones as Invitation[];

    const invitacionesExtendidas = new Array<InvitationExtended>();

    for (let invitation of invitaciones) {
      const [consultaRemitente] = await db.execute(
        "select id, nombre, email from usuarios where id=?",
        [invitation.remitente_id]
      );
      const [consultaProyecto] = await db.execute(
        "select * from proyectos where id = ?",
        [invitation.proyecto_id]
      );

      invitacionesExtendidas.push({
        ...invitation,
        destinatario: user,
        remitente: (consultaRemitente as User[])[0],
        proyecto: (consultaProyecto as Project[])[0],
      });
    }

    return createResponse(invitacionesExtendidas, 200);
  } catch (error) {
    console.error(error);

    return createErrorResponse("Error interno del servidor", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateUser(req);
    if (!user) {
      return createErrorResponse("Token expirado o inválido");
    }

    const { id, accept } = await req.json();

    if (accept) {
      const [consultaInvitation] = await db.execute(
        "select * from invitaciones where id=?",
        [id]
      );

      const invitation = (consultaInvitation as Invitation[])[0];

      const [consultaProyecto] = await db.execute(
        "select * from proyectos where id=?",
        [invitation.proyecto_id]
      );

      const proyecto = (consultaProyecto as Project[])[0];

      await db.execute(
        "insert into usuario_proyecto(usuario_id, proyecto_id) values(?, ?)",
        [user.id, proyecto.id]
      );
    }

    await db.execute("delete from invitaciones where id=?", [id]);
    return createResponse({ success: true });
  } catch (error) {
    console.log(error);

    return createErrorResponse("Error interno del servidor", 500);
  }
}
