"use client";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/types";
import { 
  ArrowLeft, 
  CheckSquare, 
  Loader, 
  Users, 
  Crown,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  UserCheck,
  Plus,
  BarChart3,
  Activity,
  Star,
  Shield,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { InviteMemberDialog } from "./invite-member-dialog";

interface ProjectViewProps {
  projectId: number;
  onBack: () => void;
}

/** el componente `ProjectView`, que muestra la vista detallada de un proyecto seleccionado. Este componente:

- Recibe como props el `projectId` y un callback `onBack` para volver a la vista anterior.
- Obtiene datos del proyecto, tareas y miembros del contexto de aplicación.
- Filtra y clasifica tareas por estado (pendiente, en progreso, completada).
- Si el usuario es el propietario, muestra opciones para invitar miembros y crear tareas.
- Muestra estadísticas generales del proyecto (miembros, tareas, progreso) y organiza las tareas en un tablero o lista mediante pestañas (`Tabs`).
- En la pestaña de miembros, muestra un listado de los colaboradores del proyecto.
- Utiliza estados locales para manejar la carga de datos y los miembros del proyecto.
- Emplea componentes de UI para estructurar visualmente la información y la interacción del usuario con el proyecto.
 */
export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const { user, token } = useAuth();
  const { projects, tasks } = useApp();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);

  console.log({ projectId });

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.proyecto_id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="border-0 shadow-2xl rounded-2xl p-8 text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Proyecto no encontrado</h3>
          <p className="text-slate-600 mb-6">
            El proyecto que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button 
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
        </Card>
      </div>
    );
  }

  const todoTasks = projectTasks.filter((t) => t.estado === "pendiente");
  const inProgressTasks = projectTasks.filter(
    (t) => t.estado === "en_progreso"
  );
  const completedTasks = projectTasks.filter((t) => t.estado === "completada");
  const isOwner = user && project && user.id === project.creador_id;

  useEffect(() => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    fetch(`/api/proyectos/${projectId}/miembros`, { headers })
      .then((res) => res.json())
      .then((miembros) => {
        setMembers(miembros);
        setLoading(false);
      });
  }, [projectId]);

  return (
    <div className="space-y-8 pb-8">
      {/* Header mejorado con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl text-white">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-xl px-4 py-2 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{project.titulo}</h1>
                <p className="text-blue-100 text-lg">{project.descripcion}</p>
              </div>
            </div>
            
            {/* Información adicional del proyecto */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">
                  Creado el {new Date(project.fecha_creacion).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-300" />
                <span className="text-blue-100 text-sm">
                  Actualizado {new Date(project.fecha_actualizacion).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {isOwner ? <Crown className="h-4 w-4 text-yellow-300" /> : <UserCheck className="h-4 w-4 text-green-300" />}
                <span className="text-blue-100 text-sm font-medium">
                  {isOwner ? 'Propietario' : 'Colaborador'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isOwner ? (
              <>
                <InviteMemberDialog projectId={projectId} />
                <CreateTaskDialog projectId={projectId} />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cards de estadísticas mejoradas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Miembros del Equipo</CardTitle>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-700">{members.length}</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
                  {members.length === 1 ? 'Solo tú' : 'Colaborativo'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {members.length === 1 ? '¡Invita colaboradores!' : 'Trabajando en equipo'}
              </p>
            </CardContent>
          </div>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Tareas Totales</CardTitle>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-700">{projectTasks.length}</span>
                <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                  {projectTasks.length === 0 ? 'Nuevo' : 'Activo'}
                </Badge>
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Pendientes: {todoTasks.length}</span>
                  <span>En curso: {inProgressTasks.length}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Progreso General</CardTitle>
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-700">
                  {projectTasks.length > 0
                    ? Math.round((completedTasks.length / projectTasks.length) * 100)
                    : 0}%
                </span>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-semibold">
                  {completedTasks.length}/{projectTasks.length}
                </Badge>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Tabs mejoradas */}
      <Tabs defaultValue="board" className="space-y-6">
        <div className="bg-white p-2 rounded-2xl shadow-lg border-0">
          <TabsList className="grid w-full grid-cols-3 bg-slate-50 rounded-xl p-1">
            <TabsTrigger 
              value="board" 
              className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Tablero Kanban
            </TabsTrigger>
            <TabsTrigger 
              value="list"
              className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Vista Lista
            </TabsTrigger>
            <TabsTrigger 
              value="members"
              className="rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
            >
              <Users className="mr-2 h-4 w-4" />
              Equipo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Columna Por Hacer */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-3">
                    <div className="h-6 w-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-3 w-3 text-yellow-600" />
                    </div>
                    Por Hacer
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-bold">
                      {todoTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {todoTasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">¡Excelente!</p>
                    <p className="text-xs text-slate-500">No hay tareas pendientes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Columna En Progreso */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-3">
                    <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-3 w-3 text-blue-600" />
                    </div>
                    En Progreso
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-bold">
                      {inProgressTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {inProgressTasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Listo para trabajar</p>
                    <p className="text-xs text-slate-500">No hay tareas en progreso</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Columna Completadas */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-3">
                    <div className="h-6 w-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckSquare className="h-3 w-3 text-green-600" />
                    </div>
                    Completadas
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-bold">
                      {completedTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {completedTasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">¡Vamos por la primera!</p>
                    <p className="text-xs text-slate-500">No hay tareas completadas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {projectTasks.map((task) => (
              <TaskCard key={task.id} task={task} showProject={false} />
            ))}
            {projectTasks.length === 0 && (
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="h-8 w-8 text-slate-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Hora de Crear Tareas!</h3>
                    <p className="text-slate-600 text-lg mb-6">
                      {isOwner 
                        ? "Crea la primera tarea para comenzar a organizar tu proyecto"
                        : "El propietario del proyecto puede crear tareas para el equipo"
                      }
                    </p>
                    {isOwner && <CreateTaskDialog projectId={projectId} />}
                  </div>
                </div>
                
                {isOwner && (
                  <CardContent className="p-6">
                    {/* Consejos para crear tareas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Define Objetivos</div>
                          <div className="text-sm text-slate-600">Tareas claras y específicas</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                        <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Asigna Responsables</div>
                          <div className="text-sm text-slate-600">Delega y colabora</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
            {/* Header de miembros con gradiente */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Equipo del Proyecto</CardTitle>
                    <CardDescription className="text-indigo-100 text-base">
                      {members.length} {members.length === 1 ? 'miembro' : 'miembros'} colaborando en este proyecto
                    </CardDescription>
                  </div>
                </div>
                {isOwner && <InviteMemberDialog projectId={projectId} />}
              </div>
            </div>

            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Cargando miembros del equipo...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Propietario */}
                  {members.length > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {members[0].nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{members[0].nombre}</p>
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-slate-600">{members[0].email}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 font-bold px-4 py-2 rounded-full">
                        <Crown className="h-3 w-3 mr-1" />
                        Propietario
                      </Badge>
                    </div>
                  )}

                  {/* Miembros colaboradores */}
                  {members.slice(1).map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{member.nombre}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-4 py-2 rounded-full">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Colaborador
                      </Badge>
                    </div>
                  ))}

                  {/* Estado vacío para miembros */}
                  {members.length <= 1 && (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">¡Invita a tu Equipo!</h3>
                      <p className="text-slate-600 mb-6">
                        {isOwner 
                          ? "Colabora con otros estudiantes para potenciar tu proyecto"
                          : "Solo tú eres miembro de este proyecto actualmente"
                        }
                      </p>
                      {isOwner && (
                        <div className="space-y-4">
                          <InviteMemberDialog projectId={projectId} />
                          
                          {/* Mensaje motivacional para miembros */}
                          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                            <p className="text-sm text-slate-700 text-center">
                              <strong className="text-green-700">¡Sabías que!</strong> Los equipos colaborativos completan proyectos{" "}
                              <span className="text-blue-700 font-semibold">3x más rápido</span> que trabajar solo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}