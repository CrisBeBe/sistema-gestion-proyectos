import { type NextRequest, NextResponse, userAgent } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { Invitation, APIResponse, InvitationExtended, Project, User} from "@/types"
import {getTokenFromHeader} from "@/lib/auth"
import { Response } from "@/types"


export interface InvitacionesPOSTBody {
  invitation_id: number;
  accept: boolean;
}
export type InvitacionesGETResponse = Response<InvitationExtended[]>;
export async function GET(request: NextRequest): APIResponse<InvitationExtended[]> {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const [invitationsResultSet] = await db.execute(
      `
      SELECT *
      FROM invitaciones i
      WHERE i.email = ? AND i.estado = 'pendiente'
      ORDER BY i.fecha_creacion DESC
    `,
      [decoded.email],
    )

    const invitations = invitationsResultSet as Invitation[];
    const result: InvitationExtended[] = await Promise.all(invitations.map(async (i) => {
      const [proyectoRS] = await db.execute("select * from proyectos where id=? limit 1;", [i.proyecto_id])
      const proyecto = (proyectoRS as Project[])[0];

      const [remitenteRS] = await db.execute("select * from usuarios where id=? limit 1;", [proyecto.creador_id])
      const remitente = (remitenteRS as User[])[0];
      return {
        ...i,
        remitente,
        proyecto
      }
    }));

    return ok(result)
  } catch (error) {
    console.error("Error obteniendo invitaciones:", error)
    return internalServerError()
  }
}

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

    const { invitation_id, accept }: InvitacionesPOSTBody = await request.json()

    const [invitationRS] = await db.execute("select * from invitaciones where id=?", [invitation_id])

    const invitation = (invitationRS as Invitation[])[0]


    await db.execute("insert into proyecto_miembros(proyecto_id, usuario_id, rol) values(?,?,?)",
      [invitation.proyecto_id, decoded.id, "colaborador"]
    )
    await db.execute("update invitaciones set estado = ? where id = ?", [accept ? "aceptada" : "rechazada", invitation_id])

    return ok({})
  } catch (error) {
    console.error("Error creando invitación:", error)
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

    const { invitacion_id, accion } = await request.json()

    if (!invitacion_id || !accion) {
      return err("ID de invitación y acción son requeridos", 400)
    }

    if (!["aceptar", "rechazar"].includes(accion)) {
      return err("Acción inválida", 400)
    }

    // Get invitation details
    const [invitationRows] = await db.execute(
      'SELECT * FROM invitaciones WHERE id = ? AND email = ? AND estado = "pendiente"',
      [invitacion_id, decoded.email],
    )

    const invitation = (invitationRows as any[])[0]
    if (!invitation) {
      return err("Invitación no encontrada", 404)
    }

    const newStatus = accion === "aceptar" ? "aceptada" : "rechazada"

    // Update invitation status
    await db.execute("UPDATE invitaciones SET estado = ? WHERE id = ?", [newStatus, invitacion_id])

    // If accepted, add user to project
    if (accion === "aceptar") {
      await db.execute("INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol) VALUES (?, ?, ?)", [
        invitation.proyecto_id,
        decoded.id,
        "colaborador",
      ])
    }

    return NextResponse.json(ok({ message: `Invitación ${newStatus} correctamente` }))
  } catch (error) {
    console.error("Error procesando invitación:", error)
    return internalServerError()
  }
}
