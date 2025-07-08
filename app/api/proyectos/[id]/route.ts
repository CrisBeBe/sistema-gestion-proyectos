import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { Project, ProjectMember, Task } from "@/types"
import {getTokenFromHeader} from "@/lib/auth"

interface Params{
  params: Promise<{id: string}>
}
export async function GET(request: NextRequest, { params }: Params ) {
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

    // Check if user has access to this project
    const [accessCheck] = await db.execute(
      `
      SELECT 1 FROM proyectos p
      LEFT JOIN proyecto_miembros pm ON p.id = pm.proyecto_id
      WHERE p.id = ? AND p.creador_id = ?
    `,
      [projectId, decoded.id],
    )

    if ((accessCheck as any[]).length === 0) {
      return err("No tienes acceso a este proyecto", 403)
    }

    // Get project details
    const [projectRows] = await db.execute(
      `
      SELECT p.*, u.nombre as creador_nombre
      FROM proyectos p
      LEFT JOIN usuarios u ON p.creador_id = u.id
      WHERE p.id = ?
    `,
      [projectId],
    )

    const project = (projectRows as Project[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    // Get project members
    const [memberRows] = await db.execute(
      `
      SELECT pm.*, u.nombre, u.email
      FROM proyecto_miembros pm
      JOIN usuarios u ON pm.usuario_id = u.id
      WHERE pm.proyecto_id = ?
    `,
      [projectId],
    )

    // Get project files
    const [fileRows] = await db.execute(
      `
      SELECT pf.*, u.nombre as subido_por_nombre
      FROM proyecto_archivos pf
      JOIN usuarios u ON pf.subido_por = u.id
      WHERE pf.proyecto_id = ?
      ORDER BY pf.fecha_subida DESC
    `,
      [projectId],
    )

    // Get tasks (only assigned tasks for collaborators)
    let taskQuery = `
      SELECT t.*, u.nombre as creador_nombre
      FROM tareas t
      LEFT JOIN usuarios u ON t.creador_id = u.id
      WHERE t.proyecto_id = ?
    `

    // If user is not the creator, only show assigned tasks
    if (project.creador_id !== decoded.id) {
      taskQuery += ` AND t.id IN (
        SELECT ta.tarea_id FROM tarea_asignaciones ta WHERE ta.usuario_id = ?
      )`
    }

    taskQuery += ` ORDER BY t.fecha_creacion DESC`

    const queryParams = project.creador_id !== decoded.id ? [projectId, decoded.id] : [projectId]

    const [taskRows] = await db.execute(taskQuery, queryParams)

    const projectWithDetails = {
      ...project,
      miembros: memberRows as ProjectMember[],
      archivos: fileRows,
      tareas: taskRows as Task[],
    }

    return NextResponse.json(ok(projectWithDetails))
  } catch (error) {
    console.error("Error obteniendo proyecto:", error)
    return internalServerError()
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { nombre, descripcion, fecha_limite, estado, presupuesto } = await request.json()

    // Check if user is the creator (only creator can modify project)
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [projectId])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador puede modificar el proyecto", 403)
    }

    await db.execute(
      "UPDATE proyectos SET nombre = ?, descripcion = ?, fecha_limite = ?, estado = ?, presupuesto = ? WHERE id = ?",
      [nombre, descripcion, fecha_limite || null, estado, presupuesto || null, projectId],
    )

    return NextResponse.json(ok({ message: "Proyecto actualizado correctamente" }))
  } catch (error) {
    console.error("Error actualizando proyecto:", error)
    return internalServerError()
  }
}

export async function DELETE(request: NextRequest, { params }: Params ) {
  try {
    const {id} =await  params;
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const projectId = Number.parseInt(id)

    // Check if user is the creator
    const [creatorCheck] = await db.execute("SELECT creador_id FROM proyectos WHERE id = ?", [projectId])

    const project = (creatorCheck as any[])[0]
    if (!project) {
      return err("Proyecto no encontrado", 404)
    }

    if (project.creador_id !== decoded.id) {
      return err("Solo el creador puede eliminar el proyecto", 403)
    }

    await db.execute("DELETE FROM proyectos WHERE id = ?", [projectId])

    return ok({})
  } catch (error) {
    console.error("Error eliminando proyecto:", error)
    return internalServerError()
  }
}
