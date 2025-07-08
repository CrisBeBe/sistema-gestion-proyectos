import { NextRequest } from "next/server";
import { internalServerError, err, ok } from "@/lib/utils";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { db } from "@/lib/database";
import { saveFile } from "@/lib/saveFile";
import { Response, APIResponse, CommentExtended } from "@/types";
import { getTaskComments } from "@/app/api/proyectos/route";

export interface ComentarioFormFields {
    contenido: string;
    archivos: File[];
}
interface Params {
    params: Promise<{ id: string }>; // id de la tarea
}

export type ComentarioPOSTBody = FormData;
export type ComentarioPOSTResponse = Response<CommentExtended>;

export async function POST(request: NextRequest, { params }: Params): APIResponse<CommentExtended> {
    try {
        const token = getTokenFromHeader(request);
        if (!token) return err("Token requerido", 401);

        const user = verifyToken(token);
        if (!user) return err("Token inválido", 401);

        const { id } = await params;
        const tarea_id = parseInt(id);

        // Verificar que la tarea exista
        const [tareaRS] = await db.execute("SELECT * FROM tareas t inner join tarea_asignaciones ta on ta.tarea_id = t.id WHERE t.id = ? and ta.usuario_id = ?", [tarea_id, user.id]);
        if ((tareaRS as any[]).length === 0) {
            return err("La tarea no existe o no tienes acceso a ella", 403);
        }

        const formData = await request.formData();
        const contenido = formData.get("contenido")?.toString() ?? "";
        const archivos = formData.getAll("archivos") as File[];

        if (!contenido.trim()) {
            return err("El contenido del comentario es requerido", 400);
        }

        // Insertar comentario
        const [result] = await db.execute(
            "INSERT INTO comentarios(contenido, tarea_id, usuario_id) VALUES (?, ?, ?)",
            [contenido, tarea_id, user.id]
        );
        const comentario_id = (result as any).insertId;

        // Guardar archivos (opcional)
        const savedFiles = await Promise.all(
            archivos.map((archivo) => saveFile(archivo))
        );

        await Promise.all(
            savedFiles.map((f) => {
                if (!f) return null;

                return db.execute(
                    "INSERT INTO comentario_archivos(comentario_id, nombre_archivo, nombre_original, tipo_archivo, tamaño, ruta_archivo, subido_por) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                        comentario_id,
                        f.nombre_archivo,
                        f.nombre_original,
                        f.tipo_archivo,
                        f.tamaño,
                        f.ruta_archivo,
                        user.id
                    ]
                );
            })
        );

        const comment = (await getTaskComments(tarea_id)).find(c => c.id == comentario_id)!;

        return ok(comment);
    } catch (e) {
        console.error(e);
        return internalServerError();
    }
}
