import { type NextRequest, NextResponse } from "next/server"
import { db, getUser } from "@/lib/database"
import { verifyToken } from "@/lib/jwt"
import { ok, err, internalServerError } from "@/lib/utils"
import type { APIResponse, ProjectExtended, UserPayload, Response, Project, User, ProjectFileExtended, ProjectFile, ProjectMember, ProjectMemberExtended, Task, TaskExtended, TaskAssignmentExtended, CommentExtended, TaskFileExtended, TaskFile, Comment, TaskAssignment, CommentFile, CommentFileExtended } from "@/types"
import { getTokenFromHeader } from "@/lib/auth"
import { parseForm, ProyectosFormFields, ProyectosFormFiles } from '@/lib/parseForm';
import { saveFile } from "@/lib/saveFile"
export type ProyectosGETResponse = Response<ProjectExtended[]>;
export async function GET(request: NextRequest): APIResponse<ProjectExtended[]> {
  try {
    
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded: UserPayload = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const [projectsRS] = await db.execute(
      `
      SELECT DISTINCT  p.*
      FROM proyectos p
      inner join proyecto_miembros pm
      WHERE pm.usuario_id = ?
      ORDER BY p.fecha_creacion DESC;
    `,
      [decoded.id],
    )

    const projects: Project[] = projectsRS as Project[]

    const result: ProjectExtended[] = await Promise.all(projects.map(async (p) => {
      const [creadorRS] = await db.execute("select * from usuarios where id=? limit 1;", [p.creador_id]);
      const creador = (creadorRS as User[])[0];
      const archivos = await getProjectFiles(p.id);
      const miembros = await getProjectMembers(p.id);
      const tareas = (await getProjectTasks(p.id)).filter(t => t.creador_id === decoded.id || t.asignados.some(a => a.usuario_id === decoded.id));

      return {
        ...p,
        creador,
        miembros, 
        tareas, 
        archivos
      }
    }));

    return ok(result)
  } catch (error) {
    console.error("Error obteniendo proyectos:", error)
    return internalServerError()
  }
}


export type ProyectosPOSTBody = FormData;

export type ProyectosPOSTResponse = Response<ProjectExtended>
export async function POST(request: NextRequest): APIResponse<ProjectExtended> {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return err("Token requerido", 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return err("Token inválido", 401)
    }

    const { fields, files }: {fields: ProyectosFormFields, files: ProyectosFormFiles} = await parseForm(await request.formData());

    const { nombre, descripcion, fecha_limite, presupuesto }= fields;

    if (!nombre) {
      return err("El nombre del proyecto es requerido", 400)
    }

    const [result] = await db.execute(
      "INSERT INTO proyectos (nombre, descripcion, fecha_limite, creador_id, presupuesto) VALUES (?, ?, ?, ?, ?)",
      [nombre, descripcion, new Date(fecha_limite), decoded.id, parseInt(presupuesto)],
    )

    const projectId = (result as any).insertId

    // Add creator as admin member
    await db.execute("INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol) VALUES (?, ?, ?)", [
      projectId,
      decoded.id,
      "admin",
    ])

    // Add project files
    const {archivos} = files;
    const savedFiles = await Promise.all(archivos.map( (a) => {
      return  saveFile(a)
    }))

    await Promise.all(savedFiles.map(async (f) => {
      console.log({f});
      
      if (!f) return null;

      await db.execute("insert into proyecto_archivos(proyecto_id, nombre_archivo, nombre_original, tipo_archivo, tamaño, ruta_archivo, subido_por) values(?, ?, ?, ?, ?, ?, ?)",
        [projectId, f.nombre_archivo, f.nombre_original, f.tipo_archivo, f.tamaño, f.ruta_archivo, decoded.id]
      )
    }))

    const [projectRS] = await db.execute("select * from proyectos where id=? limit 1", [projectId]);
    const p = (projectRS as Project[])[0];
    const [creadorRS] = await db.execute("select * from usuarios where id=? limit 1;", [p.creador_id]);
    const creador = (creadorRS as User[])[0];
    const p_archivos = await getProjectFiles(p.id);
    const miembros = await getProjectMembers(p.id);
    const tareas = await getProjectTasks(p.id);

    


    return ok({
      ...p,
      creador, 
      archivos: p_archivos,
      miembros,
      tareas
    })
  } catch (error) {
    console.error("Error creando proyecto:", error)
    return internalServerError()
  }
}


async function getProjectFiles(proyecto_id: number): Promise<ProjectFileExtended[]> {
  const [filesRS] = await db.execute("select * from proyecto_archivos where proyecto_id=?", [proyecto_id]);
  const files = filesRS as ProjectFile[];

  const result: ProjectFileExtended[] =  await Promise.all(files.map(async (f) => {
    const [usuarioRS] = await db.execute("select * from usuarios where id=? limit 1;",[ f.subido_por])
    const subido_por_usuario = (usuarioRS as User[])[0]
    return {
      ...f,
      subido_por_usuario
    }
  }))

  return result
}

async function getProjectMembers(proyecto_id: number) {
  const [membersRS] = await db.execute("select * from proyecto_miembros where proyecto_id=? && rol !='admin'", [proyecto_id]);
  const members = membersRS as ProjectMember[];

  const result: ProjectMemberExtended[] = await Promise.all(members.map(async (m) => {
    const [usuarioRS] = await db.execute("select * from usuarios where id=? limit 1", [m.usuario_id]);
    const usuario = (usuarioRS as User[])[0]

    return {
      ...m, usuario
    }
  }))

  return result
}

export async function getProjectTasks(proyecto_id: number) {
  const [tasksRS] = await db.execute("select * from tareas where proyecto_id =?", [proyecto_id])
  const tasks = tasksRS as Task[];

  const result: TaskExtended[] = await Promise.all(tasks.map(async function (t) {
    const creador = await getUser(t.creador_id)
    const asignados = await getTaskAssignments(t.id)
    const comentarios = await getTaskComments(t.id)
    const archivos = await getTasksFiles(t.id);

    return {
      ...t,
      asignados,
      comentarios,
      archivos,
      creador
    }
  }))


  return result
}

async function getTasksFiles(task_id:number): Promise<TaskFileExtended[]> {
 const [filesRS] = await db.execute("select * from tarea_archivos where tarea_id=?", [task_id]);
 const files = filesRS as TaskFile[];

 const result: TaskFileExtended[] = await Promise.all(files.map(async (f) => {
  const usuario = await getUser(f.subido_por)

  return {...f, usuario}
 }));

 return result;
}

export async function getTaskComments(task_id:number): Promise<CommentExtended[]> {
  const [commentRS] = await db.execute("select * from comentarios where tarea_id=?", [task_id])
  const comments = commentRS as Comment[];

  const result : CommentExtended[] = await Promise.all(comments.map(async (c) => {
    return {...c, usuario: await getUser(c.usuario_id), archivos: await getCommentFiles(c.id)}
  }));

  return result
}

async function getTaskAssignments(task_id: number): Promise<TaskAssignmentExtended[]> {
  const [assignmentsRS] = await db.execute("select * from tarea_asignaciones where tarea_id=?", [task_id]);
  const assignments = assignmentsRS as TaskAssignment[];

  const result: TaskAssignmentExtended[] = await Promise.all(assignments.map(async (a) => {
    return {...a, usuario: await getUser(a.usuario_id)}
  }))

  return result

}

async function getCommentFiles(comment_id: number): Promise<CommentFileExtended[]> {
  const [filesRS] = await db.execute("select * from comentario_archivos where comentario_id=?", [comment_id]);
  const files = filesRS as CommentFile[];

  const result: CommentFileExtended[] = await Promise.all(files.map(async (f) => {
    return {...f, usuario: await getUser(f.subido_por)}
  }))

  return result
}
