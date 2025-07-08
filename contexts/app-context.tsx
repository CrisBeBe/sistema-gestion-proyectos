"use client";

// Importaciones 
import { Comment, InvitationExtended, Project, Response, Task, TaskExtended } from "@/types";
import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {getAuthHeader} from "@/lib/client-utils"
import { ProjectExtended, Invitation } from "@/types";
import { ProjectFileExtended } from "@/types";
import { ProjectMemberExtended } from "@/types";
import {InvitacionesGETResponse} from "@/app/api/invitaciones/route";
import {ProyectosGETResponse, ProyectosPOSTBody, ProyectosPOSTResponse} from "@/app/api/proyectos/route";
import { ProyectoTareaFormFields, ProyectoTareaPOSTResponse } from "@/app/api/proyectos/[id]/tareas/route";
import { ComentarioFormFields, ComentarioPOSTResponse } from "@/app/api/tareas/[id]/comentarios/route";
import { ReadStream } from "fs";
// Contexto 
// Debe contener 
// - Proyectos del usuario 
// - Funciones
// - Invitaciones a colaboraciones 
  
interface AppContextType {
  projects: ProjectExtended[];
  invitations: InvitationExtended[];
  createProject: (title: string, description: string,fecha_limite: Date, presupuesto: number, files: File[]) => Promise<void>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  respondInvitation: (
    invitation: InvitationExtended,
    accept: boolean
  ) => Promise<void>;

  createTask: (proyect_id: number, task: ProyectoTareaFormFields) => Promise<void>,
  deleteTask: (task_id: number) => Promise<void>,
  updateTask: (task_id: number, newSate: "pendiente" | "en_progreso" | "completada") => Promise<void>

  addComment: (task_id: number, comment: ComentarioFormFields) => Promise<void>,

  inviteToProject: (projectId: number, email: string) => Promise<boolean>,

  dowloadFile: (filename: string, original_filename: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectExtended[]>([]);
  const [invitations, setInvitations] = useState<InvitationExtended[]>([]);

  useEffect(() => {
    if (!token) return;
    // Cargar datos iniciales
    loadData();
  }, [user?.id, token, invitations.length]);

  const loadData = async () => {
    const headers = getAuthHeader(token!)

    try {
      const [projectsRes, invitationsRes] = await Promise.all([
        fetch("/api/proyectos", {
          headers,
        }),
        fetch("/api/invitaciones", {
          headers,
        }),
      ]);

      if (projectsRes.ok) {
        const projectsData: ProyectosGETResponse = await projectsRes.json();
        if (projectsData.success && projectsData.data) {
          setProjects(projectsData.data);
        }
      }
      if (invitationsRes.ok) {
        const invitationsData: InvitacionesGETResponse = await invitationsRes.json();
        if (invitationsData.success && invitationsData.data) {
          setInvitations(invitationsData.data);
        }
      }

      alert("Información Actualizada");;
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const createProject = async (titulo: string, descripcion: string, fecha_limite: Date, presupuesto: number, files: File[]) => {
    const headers = getAuthHeader(token!)

    const formData = new FormData();
    formData.set("nombre", titulo);
    formData.set("descripcion", descripcion);
    formData.set("fecha_limite", fecha_limite.toISOString());
    formData.set("presupuesto", presupuesto.toString());

    for (const file of files) {
      formData.append("archivos", file);
    }
    

    const body: ProyectosPOSTBody = formData;
    const response = await fetch("/api/proyectos", {
      method: "POST",
      headers,
      body,
    });

    if (response.ok) {
      const result: ProyectosPOSTResponse = await response.json();
      if (result.success && result.data) {
        const newProject = result.data;
        setProjects((prev) => [...prev, newProject]);
      }
    }
  };

  const updateProject = async (id: number, updates: Partial<Project>) => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/proyectos/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
      }
    }
  };

  const deleteProject = async (id: number) => {
    const headers= getAuthHeader(token!)

    const response = await fetch(`/api/proyectos/${id}`, {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      
      }
    }
  };



  const inviteToProject = async (
    projectId: number,
    email: string
  ): Promise<boolean> => {
    const headers= getAuthHeader(token!, {
      "Content-Type": "application/json",
    });

    const response = await fetch(
      `/api/proyectos/${projectId}/miembros/invitar`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();
    return result.success;
  };

  const respondInvitation = async (
    invitation: InvitationExtended,
    accept: boolean
  ) => {
    const headers= getAuthHeader(token!, {
      "Content-Type": "application/json",
    });

    const response = await fetch("/api/invitaciones", {
      method: "POST",
      headers,
      body: JSON.stringify({ invitation_id: invitation.id, accept }),
    });

    const result = await response.json();
    if (result.success) {
      setInvitations((prev) => prev.filter((i) => i.id != invitation.id));
    }
  };

  const createTask = async (proyecto_id: number, task: ProyectoTareaFormFields) => {
    const headers = getAuthHeader(token!);

    const body = new FormData()

    body.set("titulo", task.titulo);
    body.set("descripcion", task.descripcion)
    body.set("fecha_limite", task.fecha_limite)
    body.set("prioridad", task.prioridad)
    
    for (let asignado of task.asignados){ 
      body.append("asignados", asignado.toString())
    }
    for (let file of task.archivos){ 
      body.append("archivos", file)
    }


    const response = await fetch(`/api/proyectos/${proyecto_id}/tareas`, {
      method: "POST",
      headers, 
      body
    });

    if (response.ok) {
      const result: ProyectoTareaPOSTResponse  = await response.json();
      if (result.success && result.data) {
        setProjects(prev => prev.map(p => {
          if (p.id !== proyecto_id) return p;

          return {
            ...p,
            tareas: [...p.tareas, result.data!]
          } 
        }))
      }
    }
  }

  const deleteTask = async (task_id: number) => {
    const headers = getAuthHeader(token!);

    const response = await fetch(`/api/tareas/${task_id}/`, {
      method: "DELETE",
      headers
    })

    if(response.ok) {
      const result: Response<{}> = await response.json();

      if (result.success) {
        setProjects(prev => {
          return prev.map(p => {
            return {
              ...p,
              tareas: p.tareas.filter(t => t.id !== task_id)
            }
          })
        })
      }
    }
  }

  const updateTask = async (task_id: number, newState: "pendiente" | "en_progreso" | "completada") => {
    const headers = getAuthHeader(token!);

    const response = await fetch(`/api/tareas/${task_id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        estado: newState
      })
    })

    if(response.ok) {
      const result: Response<TaskExtended[]> = await response.json()
      if (result.success && result.data) {
        setProjects(prev => {
          return prev.map(p => {
            const proyecto = p.tareas.some(t => t.id === task_id)
            if (!proyecto) return p;

            return {
              ...p, tareas: result.data!
            }
          })
        })
      }
    }

  }

  const addComment = async (task_id: number, comment: ComentarioFormFields) => {
    const headers = getAuthHeader(token!);

    const body = new FormData()

    body.set("contenido", comment.contenido);
    
    for (let file of comment.archivos){ 
      body.append("archivos", file)
    }


    const response = await fetch(`/api/tareas/${task_id}/comentarios`, {
      method: "POST",
      headers, 
      body
    });

    if (response.ok) {
      
      const result: ComentarioPOSTResponse  = await response.json();
      if (result.success && result.data) {
        
        setProjects(prev => prev.map(p => {
          if (p.tareas.some(t => t.id !== task_id)) return p;

          return {
            ...p,
            tareas: p.tareas.map((t, i) => {
              if(t.id !== task_id) return t;

              return {
                ...t,
                comentarios: [...p.tareas[i].comentarios, result.data!]
              }
            })
          } 
        }))
      }
    }
  }

  const dowloadFile = async (filename: string, original_filename: string) => {
    const headers = getAuthHeader(token!);

    const response = await fetch(`/api/archivos/${filename}`, {
      method: "GET",
      headers
    })

    if (response.ok) {
      const result= await response.blob()
      const url = URL.createObjectURL(result);

      const a = document.createElement("a");
      a.href = url;
      a.download = original_filename; // nombre sugerido para el archivo descargado
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <AppContext.Provider
      value={{
        projects,
        invitations,
        createProject,
        updateProject,
        deleteProject,
        respondInvitation,
        createTask,
        deleteTask,
        updateTask,
        addComment,
        dowloadFile,
        inviteToProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
