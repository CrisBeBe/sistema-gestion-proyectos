import { NextRequest } from "next/server";
import {internalServerError, err, ok} from "@/lib/utils"
import { getTokenFromHeader } from "@/lib/auth";
import { TaskExtended, Task , APIResponse, Project, Response} from "@/types";
import {db} from "@/lib/database"
import { verifyToken } from "@/lib/auth";
import { saveFile } from "@/lib/saveFile";
import { getProjectTasks } from "../../route";

export interface ProyectoTareaFormFields {
    titulo: string
    descripcion: string
    prioridad: "baja" | "media" | "alta"
    fecha_limite: string
    asignados: number[]
    archivos: File[]
}
interface Params {
    params: Promise<{id: string}>
}

export type ProyectoTareaPOSTBody = FormData;
export type ProyectoTareaPOSTResponse = Response<TaskExtended>
export async function POST(request: NextRequest, {params}: Params): APIResponse<TaskExtended> {
    try {
        const token = getTokenFromHeader(request)
        if (!token) {
            return err("Token requerido", 401)
        }
        const user = verifyToken(token);
        if (!user) {
            return err("Token inválido", 401)
        }

        const {id} = await params;
        const proyecto_id = parseInt(id);

        
        const [projectRS] = await db.execute("select * from proyectos where id=? and creador_id=?", [proyecto_id, user.id]);
        const proyecto = (projectRS as Project[])[0];
        
        if (!proyecto) {
            return err("El proyecto no existe o no eres el creador", 403)
        }
        
        const formData = await request.formData();
        const titulo = formData.get("titulo")!.toString();
        const descripcion = formData.get("descripcion")!.toString();
        const prioridad = formData.get("prioridad")!.toString();
        const fecha_limite = formData.get("fecha_limite")!.toString();
        const asignados = formData.getAll("asignados");
        const archivos = formData.getAll("archivos");

        const [result] = await db.execute("insert into tareas(titulo, descripcion, prioridad, fecha_limite, proyecto_id, creador_id) values(?, ?, ?, ?, ?, ?)", 
            [titulo, descripcion, prioridad, new Date(fecha_limite), proyecto_id, user.id]
        )
        const tarea_id = (result as any).insertId;

        console.log({asignados});
        

        await Promise.all(asignados.map((a) => {
            return db.execute("insert into tarea_asignaciones(tarea_id, usuario_id) values(?, ?)", 
                [tarea_id, parseInt(a.toString())]
            )
        }))

        const savedFiles = await Promise.all(archivos.map((a) => {
            return saveFile(a as File)
        }))

        await Promise.all(savedFiles.map((f) => {
            if (!f) return null;

            return db.execute("insert into tarea_archivos(tarea_id, nombre_archivo, nombre_original, tipo_archivo, tamaño, ruta_archivo, subido_por) values(?, ?, ?, ?, ?, ?, ?)",
                [tarea_id, f.nombre_archivo, f.nombre_original, f.tipo_archivo, f.tamaño, f.ruta_archivo, user.id]
            )
        }))

        return ok((await getProjectTasks(proyecto_id)).filter(t => t.id === tarea_id)[0])

    }catch(e) {
        console.error(e);
        return internalServerError()
    }
}