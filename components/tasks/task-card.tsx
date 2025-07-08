"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";

import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  User,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { TaskDetailDialog } from "./task-detail-dialog";

interface TaskCardProps {
  task_id: number;
  project_id: number;
  showProject?: boolean;
}

/**  
 ** Componente `TaskCard` que muestra la información de una tarea en forma de tarjeta interactiva.
* Muestra título, descripción, prioridad, estado, fecha límite y número de comentarios de la tarea.
* Cambia el color de la tarjeta si la tarea está vencida y no completada.
* Permite cambiar el estado de la tarea (pendiente, en progreso, completada) si el usuario está asignado.
* Abre un diálogo con detalles de la tarea al hacer clic en el encabezado.
* Carga los comentarios de la tarea desde la API al montar el componente.
* Utiliza badges de colores para mostrar visualmente la prioridad y el estado de la tarea.
* Usa hooks de contexto para acceder a datos globales de la app, autenticación y actualización de tareas.

 */
export function TaskCard({ task_id, project_id, showProject = false }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { projects, updateTask } = useApp();
  const { token, user } = useAuth();

  const project = projects.find((p) => p.id === project_id)!;
  const task = project.tareas.find(t => t.id === task_id)!;
  const comments = task.comentarios;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "alta":
        return {
          color: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          icon: AlertTriangle,
          label: "Alta Prioridad",
          bgAccent: "bg-red-50 border-red-200"
        };
      case "media":
        return {
          color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
          icon: Clock,
          label: "Prioridad Media",
          bgAccent: "bg-yellow-50 border-yellow-200"
        };
      case "baja":
        return {
          color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
          icon: CheckCircle2,
          label: "Baja Prioridad",
          bgAccent: "bg-green-50 border-green-200"
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          icon: Clock,
          label: "Prioridad Media",
          bgAccent: "bg-gray-50 border-gray-200"
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completada":
        return {
          color: "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
          icon: CheckCircle2,
          label: "Completada",
          bgAccent: "bg-green-50 border-green-200"
        };
      case "en_progreso":
        return {
          color: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          icon: Play,
          label: "En Progreso",
          bgAccent: "bg-blue-50 border-blue-200"
        };
      case "pendiente":
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          icon: Pause,
          label: "Por Hacer",
          bgAccent: "bg-gray-50 border-gray-200"
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          icon: Pause,
          label: "Por Hacer",
          bgAccent: "bg-gray-50 border-gray-200"
        };
    }
  };

  const handleStatusChange = async (
  newStatus: "pendiente" | "en_progreso" | "completada"
) => {
  await updateTask(task.id, newStatus );
  task.estado = newStatus; 
};

  const isOverdue =
    task.fecha_limite &&
    new Date(task.fecha_limite) < new Date() &&
    task.estado !== "completada";

  const priorityConfig = getPriorityConfig(task.prioridad);
  const statusConfig = getStatusConfig(task.estado);

  return (
    <>
      <Card
        className={`group relative overflow-hidden transition-all duration-300 cursor-pointer 
          ${isOverdue ? 
            "border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50 shadow-red-100" : 
            "hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50"
          } 
          ${task.estado === 'completada' ? 'ring-2 ring-green-200 bg-gradient-to-br from-green-50 to-emerald-50' : ''}
          rounded-2xl border-0 shadow-lg`}
      >
        
        {/* Indicador de estado lateral */}
        
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          task.estado === 'completada' ? 'bg-gradient-to-b from-green-500 to-emerald-500' :
          task.estado === 'en_progreso' ? 'bg-gradient-to-b from-blue-500 to-indigo-500' :
          'bg-gradient-to-b from-gray-400 to-slate-400'
        }`} />

        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <CardHeader className="pb-4 pt-6 pl-6" onClick={() => setShowDetail(true)}>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight tracking-tight text-slate-900 truncate">
                  {task.titulo}
                </h3>
                
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  </div>
                
              </div>
              
              {showProject && project && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                    {project.nombre}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {task.descripcion}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
              <Badge className={`${priorityConfig.color} shadow-lg border-0 px-3 py-1 rounded-xl font-semibold text-xs`}>
                <priorityConfig.icon className="h-3 w-3 mr-1" />
                {task.prioridad === "alta" ? "Alta" : task.prioridad === "media" ? "Media" : "Baja"}
              </Badge>
              
              <Badge className={`${statusConfig.color} shadow-lg border-0 px-3 py-1 rounded-xl font-semibold text-xs`}>
                <statusConfig.icon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-6 px-6">
          <div className="space-y-4">
            {/* Información adicional */}
            <div className="flex items-center gap-6 text-sm">
              {task.fecha_limite && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  isOverdue ? 
                    "bg-red-100 text-red-700 border border-red-200" : 
                    "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {new Date(task.fecha_limite).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  {isOverdue && (
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                      VENCIDA
                    </span>
                  )}
                </div>
              )}
              
              {comments.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{comments.length}</span>
                  <span className="text-xs">comentario{comments.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            
              <div className="flex flex-wrap gap-2">
                {task.estado !== "pendiente" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("pendiente");
                    }}
                    className="bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-300 text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Por Hacer
                  </Button>
                )}
                
                {task.estado !== "en_progreso" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("en_progreso");
                    }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-300 text-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    En Progreso
                  </Button>
                )}
                
                {task.estado !== "completada" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("completada");
                    }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-300 text-green-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completar
                  </Button>
                )}
              </div>

            {/* Indicador de progreso visual */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Estado del Proyecto</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-slate-500">
                    {task.estado === 'completada' ? 'Finalizada' : 
                     task.estado === 'en_progreso' ? 'En desarrollo' : 'Pendiente'}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    task.estado === 'completada' ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' :
                    task.estado === 'en_progreso' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-1/2' :
                    'bg-gradient-to-r from-gray-400 to-slate-400 w-1/4'
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>

        {/* Overlay de estado completado */}
        {task.estado === 'completada' && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        )}
      </Card>

      <TaskDetailDialog
        task_id={task.id}
        project_id={task.proyecto_id}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
