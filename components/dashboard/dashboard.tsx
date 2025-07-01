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
  Plus,
  Calendar,
  Users,
  Clock,
  TrendingUp,
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
          <div className="space-y-8">
            {/* Header mejorado con gradiente */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight">
                    ¡Hola, {user?.nombre}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Aquí tienes un resumen de tu progreso hoy
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <CreateProjectDialog />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Estadísticas mejoradas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-700">
                    Proyectos Activos
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {projects.length}
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    En progreso
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-orange-700">
                    Tareas Pendientes
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 mb-1">
                    {pendingTasks.length}
                  </div>
                  <div className="flex items-center text-xs text-orange-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Por completar
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-green-700">
                    Tareas Completadas
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {completedTasks.length}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Finalizadas
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-red-700">
                    Tareas Vencidas
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700 mb-1">
                    {overdueTasks.length}
                  </div>
                  <div className="flex items-center text-xs text-red-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Atrasadas
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sección de contenido principal mejorada */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        Proyectos Recientes
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Tus proyectos más recientes
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentView("projects")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Ver todos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project, index) => (
                      <div
                        key={project.id}
                        className="group relative p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer bg-white"
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`h-3 w-3 rounded-full ${
                                index === 0 ? 'bg-green-500' : 
                                index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                              }`}></div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {project.titulo}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {project.descripcion}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Actualizado: {project.fecha_actualizacion}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center py-12">
                        <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">
                          No tienes proyectos aún
                        </p>
                        <CreateProjectDialog />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Clock className="h-5 w-5 text-orange-600" />
                        Tareas Próximas
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Tareas con fechas límite cercanas
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentView("tasks")}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      Ver todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {tasks
                      .filter((t) => t.fecha_limite && t.estado !== "completada")
                      .sort(
                        (a, b) =>
                          new Date(a.fecha_limite!).getTime() -
                          new Date(b.fecha_limite!).getTime()
                      )
                      .slice(0, 3)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="group p-4 border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-700 transition-colors">
                                {task.titulo}
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Vence: {new Date(task.fecha_limite!).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                task.prioridad === "alta"
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : task.prioridad === "media"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                            >
                              {task.prioridad === "alta"
                                ? "Alta"
                                : task.prioridad === "media"
                                ? "Media"
                                : "Baja"}
                            </div>
                          </div>
                        </div>
                      ))}
                    {tasks.filter((t) => t.fecha_limite && t.estado !== "completada").length === 0 && (
                      <div className="text-center py-12">
                        <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">
                          No tienes tareas próximas
                        </p>
                      </div>
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar mejorado */}
      <div className="w-72 bg-white border-r border-slate-200 shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-xl font-bold text-white tracking-wide">StudyCollab</h1>
          </div>
          <div className="flex-1 overflow-auto py-6">
            <nav className="px-4 space-y-2">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 text-sm font-medium transition-all duration-200 ${
                  currentView === "dashboard" 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setCurrentView("dashboard")}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Button>
              <Button
                variant={currentView === "projects" ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 text-sm font-medium transition-all duration-200 ${
                  currentView === "projects" 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setCurrentView("projects")}
              >
                <FolderOpen className="mr-3 h-5 w-5" />
                Proyectos
              </Button>
              <Button
                variant={currentView === "tasks" ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 text-sm font-medium transition-all duration-200 ${
                  currentView === "tasks" 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setCurrentView("tasks")}
              >
                <CheckSquare className="mr-3 h-5 w-5" />
                Tareas
              </Button>
            </nav>
          </div>
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {user?.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.nombre}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 max-w-7xl">{renderContent()}</div>
      </div>
    </div>
  );
}