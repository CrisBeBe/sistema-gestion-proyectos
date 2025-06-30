"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import useTask from "@/hooks/use-task";
import { useToast } from "@/hooks/use-toast";
import { Commentary, Task, TaskPriority, TaskStatus } from "@/types";
import { Calendar, MessageSquare, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { projects, addComment, deleteTask, updateTask } = useApp();
  const [comments, setComments] = useState<Commentary[]>([]);
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { assignedTo } = useTask(task.id);

  const project = projects.find((p) => p.id === task.proyecto_id);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comentario = await addComment(task.id, newComment);

      setComments((prev) => [...prev, comentario]);
      setNewComment("");
      toast({
        title: "Comentario agregado",
        description: "Tu comentario ha sido agregado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      await deleteTask(task.id);
      onOpenChange(false);
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada exitosamente.",
      });
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask(task.id, { estado: newStatus });
    toast({
      title: "Estado actualizado",
      description: "El estado de la tarea ha sido actualizado.",
    });
  };

  const getPriorityColor = (priority: TaskPriority) => {
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

  const getStatusColor = (status: TaskStatus) => {
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
      });
  }, [task]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{task.titulo}</DialogTitle>
              <DialogDescription>Proyecto: {project?.titulo}</DialogDescription>
            </div>
            {user?.id === project?.creador_id ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteTask}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge className={getPriorityColor(task.prioridad)}>
              Prioridad:{" "}
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
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Vencida
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground">{task.descripcion}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Asignado a</h3>
              <div className="flex flex-wrap gap-2">
                {assignedTo.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full"
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{user.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {task.fecha_limite && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                  Fecha límite:{" "}
                  {new Date(task.fecha_limite).toLocaleDateString()}
                  {isOverdue && " (Vencida)"}
                </span>
              </div>
            )}

            {assignedTo.find((u) => u.id === user?.id) ? (
              <div className="flex gap-2">
                <h3 className="font-semibold">Cambiar Estado:</h3>

                <div className="flex gap-1">
                  {task.estado !== "pendiente" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("pendiente")}
                    >
                      Por Hacer
                    </Button>
                  )}
                  {task.estado !== "en_progreso" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("en_progreso")}
                    >
                      En Progreso
                    </Button>
                  )}
                  {task.estado !== "completada" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("completada")}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Comentarios ({comments.length})</h3>
            </div>

            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                placeholder="Agregar un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !newComment.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? "Enviando..." : "Comentar"}
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                          {comment.user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">
                          {comment.user.email}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.fecha_creacion).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm">{comment.contenido}</p>
                  </CardContent>
                </Card>
              ))}
              {comments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
