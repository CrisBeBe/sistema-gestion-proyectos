import { ReactNode } from "react";

interface User {
  id: number;
  email: string;
  nombre: string;
}

interface Payload extends User {}

interface Project {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creador_id: number;
}

type TaskStatus = "pendiente" | "en_progreso" | "completada";
type TaskPriority = "baja" | "media" | "alta";

interface Task {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: TaskPriority;
  estado: TaskStatus;
  fecha_limite: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  proyecto_id: number;
  creador_id: number;
}

interface Commentary {
  id: number;
  contenido: string;
  fecha_creacion: string;
  usuario_id: number;
  tarea_id: number;

  user: User;
}

interface Invitation {
  id: number;
  destinatario_id: number;
  remitente_id: number;
  proyecto_id: number;
}

interface InvitationExtended extends Invitation {
  destinatario: User;
  remitente: User;
  proyecto: Project;
}

interface Props {
  children?: Readonly<ReactNode>;
}

interface ProjectDetailProps extends Props {
  params: Promise<{ id: string }>;
}
