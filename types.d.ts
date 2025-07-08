import { NextResponse } from "next/server"

export interface User {
  id: number
  nombre: string
  email: string
  password?: string
  fecha_creacion: string
  avatar?: string
}

export interface UserPayload {
  id: number;
  email: string;
  nombre: string;
}

export interface Project {
  id: number
  nombre: string
  descripcion: string
  fecha_creacion: string
  fecha_limite?: string
  estado: "activo" | "completado" | "pausado"
  creador_id: number
  presupuesto: number
  
}

export interface ProjectMember {
  id: number
  proyecto_id: number
  usuario_id: number
  rol: "admin" | "colaborador"
  fecha_union: string
}

export interface ProjectMemberExtended extends ProjectMember {
  usuario: User;
}

export interface Task {
  id: number
  titulo: string
  descripcion: string
  estado: "pendiente" | "en_progreso" | "completada"
  prioridad: "baja" | "media" | "alta"
  fecha_creacion: string
  fecha_limite?: string
  proyecto_id: number
  creador_id: number
}

export type TaskStatus = "pendiente" | "en_progreso" | "completada";

export interface TaskExtended extends Task {
  asignados: TaskAssignmentExtended[]
  comentarios: CommentExtended[]
  archivos: TaskFileExtended[]
  creador: User
}

export interface TaskAssignment {
  id: number
  tarea_id: number
  usuario_id: number
  fecha_asignacion: string
}

export interface TaskAssignmentExtended extends TaskAssignment {
  usuario: User
}

export interface Comment {
  id: number
  contenido: string
  fecha_creacion: string
  tarea_id: number
  usuario_id: number
}

export interface Invitation {
  id: number
  proyecto_id: number
  email: string
  estado: "pendiente" | "aceptada" | "rechazada"
  fecha_creacion: string
}

export interface ProjectFile {
  id: number
  proyecto_id: number
  nombre_archivo: string
  nombre_original: string
  tipo_archivo: string
  tamaño: number
  ruta_archivo: string
  subido_por: number
  fecha_subida: string
}
export interface ProjectFileExtended extends ProjectFile{
  subido_por_usuario: User
}

export interface TaskFile {
  id: number
  tarea_id: number
  nombre_archivo: string
  nombre_original: string
  tipo_archivo: string
  tamaño: number
  ruta_archivo: string
  subido_por: number
  fecha_subida: string
}

export interface TaskFileExtended extends TaskFile {
  usuario: User;
}

export interface CommentFile {
  id: number
  comentario_id: number
  nombre_archivo: string
  nombre_original: string
  tipo_archivo: string
  tamaño: number
  ruta_archivo: string
  subido_por: number
  fecha_subida: string
}
export interface CommentFileExtended extends CommentFile {
  usuario: User
}

export interface Response<T> {
  success: boolean
  error: string | null
  data: T | null
}


export interface DashboardStats {
  totalProyectos: number
  proyectosActivos: number
  tareasAsignadas: number
  tareasCompletadas: number
  proyectosRecientes: Project[]
  tareasRecientes: Task[]
}

export interface InvitationExtended extends Invitation {
  remitente: User;
  proyecto: Project;
}

export interface CommentExtended extends Comment {
  usuario: User;
  archivos: CommentFileExtended[];
}

export interface ProjectExtended extends Project {
  creador: User
  miembros: ProjectMemberExtended[]
  tareas: TaskExtended[]
  archivos: ProjectFileExtended[]
}

export type APIResponse<T> = Promise<NextResponse<Response<T>>>;
export interface AuthHeaders {
  authorization: string;
  [key: string] : string;
}


export type TaskPriority = "baja" | "media" | "alta"