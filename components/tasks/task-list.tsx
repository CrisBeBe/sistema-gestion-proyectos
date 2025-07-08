"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { 
  CheckSquare, 
  Target, 
  Clock, 
  Play, 
  CheckCircle2, 
  ListTodo,
  TrendingUp,
  Calendar,
  Sparkles
} from "lucide-react";
import { TaskCard } from "./task-card";

/**  
 * Componente `TaskList` que muestra y organiza todas las tareas del usuario en pestañas.
* Divide las tareas en cuatro categorías: todas, por hacer, en progreso y completadas.
* Usa el componente `Tabs` para navegar entre las categorías de tareas.
* Muestra la cantidad de tareas en cada pestaña.
* Renderiza cada tarea usando el componente `TaskCard`.
* Si no hay tareas en una categoría, muestra un mensaje de estado con íconos y texto informativo.
* Obtiene datos de tareas y proyectos desde el contexto global de la aplicación.
* Presenta encabezado con título y descripción de la sección de tareas.
*
 */
export function TaskList() {
  const { user } = useAuth();
  const { projects } = useApp();

  const tasks = projects.map(p => p.tareas).flat();
  const todoTasks = tasks.filter((t) => t.estado === "pendiente");
  const inProgressTasks = tasks.filter((t) => t.estado === "en_progreso");
  const completedTasks = tasks.filter((t) => t.estado === "completada");

  // Calcular estadísticas
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const overdueTasks = tasks.filter(task => {
    if (!task.fecha_limite || task.estado === "completada") return false;
    return new Date(task.fecha_limite) < new Date();
  }).length;

  return (
    <div className="space-y-8">
      {/* Header mejorado con gradiente */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ListTodo className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold">Mis Tareas</h2>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Organiza, prioriza y completa tus tareas de manera eficiente
              </p>
            </div>
            <div className="hidden md:block">
              <Sparkles className="h-16 w-16 text-white/20" />
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-300" />
                <div>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                  <p className="text-blue-100 text-sm">Tasa de Completado</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-300" />
                <div>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                  <p className="text-blue-100 text-sm">Tareas Totales</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                  <p className="text-blue-100 text-sm">Tareas Vencidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs mejoradas */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
          <TabsList className="w-full bg-transparent p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-4 font-semibold transition-all duration-200"
            >
              <Target className="h-5 w-5 mr-2" />
              Todas ({tasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="todo" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-4 font-semibold transition-all duration-200"
            >
              <Clock className="h-5 w-5 mr-2" />
              Por Hacer ({todoTasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="in-progress" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-4 font-semibold transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              En Progreso ({inProgressTasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-4 font-semibold transition-all duration-200"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Completadas ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenido de todas las tareas */}
        <TabsContent value="all" className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task_id={task.id} project_id={task.proyecto_id} showProject={true} />
          ))}
          {tasks.length === 0 && (
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-center py-16 px-8">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="relative">
                      <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl">
                        <CheckSquare className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-slate-800">¡Comienza tu productividad!</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Aún no tienes tareas asignadas. Las tareas aparecerán aquí cuando sean creadas en tus proyectos colaborativos.
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <p className="text-sm text-slate-500">
                        <strong className="text-blue-600">💡 Tip:</strong> Únete a proyectos o crea el tuyo para empezar a gestionar tareas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contenido de tareas pendientes */}
        <TabsContent value="todo" className="space-y-4">
          {todoTasks.map((task) => (
            <TaskCard key={task.id} task_id={task.id} project_id={task.proyecto_id} showProject={true} />
          ))}
          {todoTasks.length === 0 && (
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 text-center py-12 px-8">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-slate-400 to-gray-400 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">¡Excelente trabajo!</h3>
                      <p className="text-slate-600">
                        No tienes tareas pendientes en este momento
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contenido de tareas en progreso */}
        <TabsContent value="in-progress" className="space-y-4">
          {inProgressTasks.map((task) => (
            <TaskCard key={task.id} task_id={task.id} project_id={task.proyecto_id} showProject={true} />
          ))}
          {inProgressTasks.length === 0 && (
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 text-center py-12 px-8">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">¡Listos para la acción!</h3>
                      <p className="text-slate-600">
                        No tienes tareas en progreso. ¡Es momento de empezar algo nuevo!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contenido de tareas completadas */}
        <TabsContent value="completed" className="space-y-4">
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task_id={task.id} project_id={task.proyecto_id} showProject={true} />
          ))}
          {completedTasks.length === 0 && (
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 text-center py-12 px-8">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800">¡Prepárate para celebrar!</h3>
                      <p className="text-slate-600">
                        Aún no has completado ninguna tarea. ¡Los logros aparecerán aquí!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Mensaje motivacional al final */}
      {tasks.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold">
                ¡Sigue así! Has completado {completedTasks.length} de {tasks.length} tareas.
              </p>
              <p className="text-slate-600 text-sm">
                {completionRate >= 80 ? "¡Excelente progreso!" : completionRate >= 50 ? "¡Buen ritmo de trabajo!" : "¡Cada paso cuenta hacia el éxito!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
