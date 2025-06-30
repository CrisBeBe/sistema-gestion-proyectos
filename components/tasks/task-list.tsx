"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { CheckSquare } from "lucide-react";
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

 */
export function TaskList() {
  const { user } = useAuth();
  const { tasks, projects } = useApp();

  const todoTasks = tasks.filter((t) => t.estado === "pendiente");
  const inProgressTasks = tasks.filter((t) => t.estado === "en_progreso");
  const completedTasks = tasks.filter((t) => t.estado === "completada");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tareas</h2>
          <p className="text-muted-foreground">
            Gestiona todas tus tareas en un solo lugar
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">Por Hacer ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">
            En Progreso ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} showProject={true} />
          ))}
          {tasks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes tareas</h3>
                <p className="text-muted-foreground mb-4">
                  Las tareas aparecerán aquí cuando sean creadas en tus
                  proyectos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-3">
          {todoTasks.map((task) => (
            <TaskCard key={task.id} task={task} showProject={true} />
          ))}
          {todoTasks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes tareas pendientes
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressTasks.map((task) => (
            <TaskCard key={task.id} task={task} showProject={true} />
          ))}
          {inProgressTasks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes tareas en progreso
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} showProject={true} />
          ))}
          {completedTasks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  No tienes tareas completadas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
