"use client";

import { Commentary, InvitationExtended, Project, Task } from "@/types";
import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  invitations: InvitationExtended[];
  createProject: (title: string, description: string) => Promise<void>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createTask: (
    projectId: number,
    task: Omit<Task, "id" | "fecha_creacion" | "fecha_actualizacion">,
    assignTo: number[]
  ) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  addComment: (taskId: number, content: string) => Promise<Commentary>;
  inviteToProject: (projectId: number, email: string) => Promise<boolean>;
  respondInvitation: (
    invitation: InvitationExtended,
    accept: boolean
  ) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invitations, setInvitations] = useState<InvitationExtended[]>([]);

  useEffect(() => {
    if (!token) return;
    // Cargar datos iniciales
    loadData();
  }, [user?.id, token, invitations.length]);

  const loadData = async () => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    try {
      const [projectsRes, tasksRes, invitationsRes] = await Promise.all([
        fetch("/api/proyectos", {
          headers,
        }),
        fetch("/api/tareas", {
          headers,
        }),
        fetch("/api/invitaciones", {
          headers,
        }),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (invitationsRes.ok) setInvitations(await invitationsRes.json());

      console.log("User Data Updated");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const createProject = async (titulo: string, descripcion: string) => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/proyectos", {
      method: "POST",
      headers,
      body: JSON.stringify({ titulo, descripcion }),
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects((prev) => [...prev, newProject]);
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
      const updatedProject = await response.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
    }
  };

  const deleteProject = async (id: number) => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/proyectos/${id}`, {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.filter((t) => t.proyecto_id !== id));
    }
  };

  const createTask = async (
    projectId: number,
    task: Omit<Task, "id" | "fecha_creacion" | "fecha_actualizacion">,
    assignTo: number[]
  ) => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/tareas", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...task,
        proyecto_id: projectId,
        asignar_a: assignTo,
      }),
    });

    if (response.ok) {
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    const response = await fetch(`/api/tareas/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    }
  };

  const deleteTask = async (id: number) => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    const response = await fetch(`/api/tareas/${id}`, {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const addComment = async (
    tarea_id: number,
    contenido: string
  ): Promise<Commentary> => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    const res = await fetch("/api/comentarios", {
      method: "POST",
      headers,
      body: JSON.stringify({ tarea_id, contenido }),
    });

    return res.json();
  };

  const inviteToProject = async (
    projectId: number,
    email: string
  ): Promise<boolean> => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `/api/proyectos/${projectId}/miembros/invitar`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email }),
      }
    );

    return response.ok;
  };

  const respondInvitation = async (
    invitation: InvitationExtended,
    accept: boolean
  ) => {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    await fetch("/api/invitaciones", {
      method: "POST",
      headers,
      body: JSON.stringify({ id: invitation.id, accept }),
    });

    setInvitations((prev) => prev.filter((i) => i.id != invitation.id));
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        invitations,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        inviteToProject,
        respondInvitation,
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
