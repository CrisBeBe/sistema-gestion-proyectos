"use client";

import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectView } from "@/components/projects/project-view";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertCircle,
  CheckSquare,
  FolderOpen,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

type View = "dashboard" | "projects" | "tasks" | "project-detail";

/**
 Elcomponente `Dashboard` en React que funciona como la vista principal de la aplicación "StudyCollab". Este componente:

* Administra la vista actual (`dashboard`, `projects`, `tasks`, o `project-detail`) y el proyecto seleccionado mediante estados locales.
* Obtiene información de usuario, autenticación y datos de proyectos, tareas e invitaciones desde contextos de aplicación.
* Calcula estadísticas de proyectos y tareas (pendientes, completadas, vencidas).
* Incluye un efecto que muestra un diálogo de confirmación cuando el usuario recibe una invitación a un proyecto y responde automáticamente.
* Renderiza una barra lateral de navegación con botones para cambiar la vista y muestra la información del usuario actual y un botón para cerrar sesión.
* Muestra, según la vista seleccionada, un resumen de métricas, lista de proyectos recientes, tareas próximas o componentes dedicados para gestión de proyectos y tareas.
* Utiliza componentes de UI como `Card`, `Button` y diversos íconos para organizar visualmente la información y las acciones.

El objetivo es proveer una interfaz integral para gestionar proyectos y tareas colaborativas dentro de la plataforma.


*/ 


export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const { user, logout, token } = useAuth();
  const { projects, tasks, invitations, respondInvitation } = useApp();

  const pendingTasks = tasks.filter((t) => t.estado !== "completada");
  const completedTasks = tasks.filter((t) => t.estado === "completada");
  const overdueTasks = tasks.filter(
    (t) =>
      t.fecha_limite &&
      new Date(t.fecha_limite) < new Date() &&
      t.estado !== "completada"
  );

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView("project-detail");
  };

  const renderContent = () => {
    switch (currentView) {
      case "projects":
        return <ProjectList onProjectSelect={handleProjectSelect} />;
      case "tasks":
        return <TaskList />;
      case "project-detail":
        return selectedProjectId ? (
          <ProjectView
            projectId={selectedProjectId}
            onBack={() => setCurrentView("projects")}
          />
        ) : null;
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                  Bienvenido de vuelta, {user?.nombre}
                </p>
              </div>
              <CreateProjectDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Proyectos Activos
                  </CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tareas Pendientes
                  </CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pendingTasks.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tareas Completadas
                  </CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tareas Vencidas
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {overdueTasks.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Proyectos Recientes</CardTitle>
                  <CardDescription>Tus proyectos más recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div>
                          <p className="font-medium text-black">
                            {project.titulo}
                          </p>
                          <p className="text-sm text-gray-900">
                            {project.descripcion}
                          </p>
                          <p className="font-thin text-xs text-gray-300 text-muted-foreground">
                            Última actualización: {project.fecha_actualizacion}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No tienes proyectos aún. ¡Crea tu primer proyecto!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tareas Próximas</CardTitle>
                  <CardDescription>
                    Tareas con fechas límite cercanas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks
                      .filter(
                        (t) => t.fecha_limite && t.estado !== "completada"
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.fecha_limite!).getTime() -
                          new Date(b.fecha_limite!).getTime()
                      )
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{task.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              Vence:{" "}
                              {new Date(
                                task.fecha_limite!
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              task.prioridad === "alta"
                                ? "bg-red-100 text-red-800"
                                : task.prioridad === "media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.prioridad === "alta"
                              ? "Alta"
                              : task.prioridad === "media"
                              ? "Media"
                              : "Baja"}
                          </div>
                        </div>
                      ))}
                    {tasks.filter(
                      (t) => t.fecha_limite && t.estado !== "completada"
                    ).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No tienes tareas próximas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    if (!token || invitations.length === 0) return;

    let invitation = invitations[0];

    const accept = confirm(
      `Usted ha sido invitado por ${invitation.remitente.nombre} (${invitation.remitente.email}) para formar parte del proyecto '${invitation.proyecto.titulo}'.\n¿Desea aceptar la invitación?`
    );

    respondInvitation(invitation, accept);
  }, [invitations.length, user]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/10">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <h1 className="text-lg font-semibold">StudyCollab</h1>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setCurrentView("dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "projects" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setCurrentView("projects")}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Proyectos
              </Button>
              <Button
                variant={currentView === "tasks" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setCurrentView("tasks")}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Tareas
              </Button>
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
