"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import useTask from "@/hooks/use-task";
import { Commentary, Task } from "@/types";
import { Calendar, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskDetailDialog } from "./task-detail-dialog";

interface TaskCardProps {
  task: Task;
  showProject?: boolean;
}

export function TaskCard({ task, showProject = false }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { projects, updateTask } = useApp();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Commentary[]>([]);
  const { assignedTo } = useTask(task.id);

  const project = projects.find((p) => p.id === task.proyecto_id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baja":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "en_progreso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendiente":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusChange = async (
    newStatus: "pendiente" | "en_progreso" | "completada"
  ) => {
    await updateTask(task.id, { estado: newStatus });
  };

  const isOverdue =
    task.fecha_limite &&
    new Date(task.fecha_limite) < new Date() &&
    task.estado !== "completada";

  useEffect(() => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    fetch(`/api/comentarios?id_tarea=${task.id}`, { headers })
      .then((res) => res.json())
      .then((comments) => {
        setComments(comments);
        setLoading(false);
      });
  }, [task]);

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow cursor-pointer ${
          isOverdue ? "border-red-200 bg-red-50" : ""
        }`}
      >
        <CardHeader className="pb-3" onClick={() => setShowDetail(true)}>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold leading-none tracking-tight">
                {task.titulo}
              </h3>
              {showProject && project && (
                <p className="text-sm text-muted-foreground">
                  {project.titulo}
                </p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.descripcion}
              </p>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Badge className={getPriorityColor(task.prioridad)}>
                {task.prioridad === "alta"
                  ? "Alta"
                  : task.prioridad === "media"
                  ? "Media"
                  : "Baja"}
              </Badge>
              <Badge className={getStatusColor(task.estado)}>
                {task.estado === "completada"
                  ? "Completada"
                  : task.estado === "en_progreso"
                  ? "En Progreso"
                  : "Por Hacer"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 grid-rows-2 gap-1">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {task.fecha_limite && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue ? "text-red-600" : ""
                  }`}
                >
                  <p>Fecha Límite: </p>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(task.fecha_limite).toLocaleDateString()}
                  </span>
                  {isOverdue && (
                    <span className="text-red-600 font-medium">(Vencida)</span>
                  )}
                </div>
              )}
              {comments.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length}</span>
                </div>
              )}
            </div>
            {assignedTo.find((u) => u.id === user?.id) ? (
              <div className="flex gap-1">
                {task.estado !== "pendiente" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange("pendiente");
                    }}
                  >
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
                  >
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
                  >
                    Completar
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
