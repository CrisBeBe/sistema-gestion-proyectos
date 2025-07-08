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
import { Task, TaskPriority, TaskStatus } from "@/types";
import { 
  Calendar, 
  MessageSquare, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User,
  Target,
  FileText,
  FileIcon,
  DownloadIcon
} from "lucide-react";
import { useEffect, useState } from "react";

interface TaskDetailDialogProps {
  task_id: number;
  project_id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function TaskDetailDialog({
  task_id,
  project_id,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { projects, addComment, deleteTask, updateTask, dowloadFile } = useApp();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const project = projects.find((p) => p.id === project_id)!;
  const task = project.tareas.find(t => t.id === task_id)!;
  const task_files = task.archivos;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comentario = await addComment(task.id, {
        contenido: newComment,
        archivos: files
      });
      
      setNewComment("");
      toast({
        title: "¡Comentario agregado!",
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
      setFiles([]);
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
    await updateTask(task.id,  newStatus );
    toast({
      title: "¡Estado actualizado!",
      description: "El estado de la tarea ha sido actualizado exitosamente.",
    });
  };

  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case "alta":
        return {
          className: "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200",
          icon: AlertTriangle,
          label: "Alta Prioridad"
        };
      case "media":
        return {
          className: "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200",
          icon: Clock,
          label: "Prioridad Media"
        };
      case "baja":
        return {
          className: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200",
          icon: CheckCircle2,
          label: "Baja Prioridad"
        };
      default:
        return {
          className: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border border-slate-200",
          icon: Clock,
          label: "Sin Prioridad"
        };
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case "completada":
        return {
          className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
          icon: CheckCircle2,
          label: "Completada"
        };
      case "en_progreso":
        return {
          className: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0",
          icon: Clock,
          label: "En Progreso"
        };
      case "pendiente":
        return {
          className: "bg-gradient-to-r from-slate-400 to-gray-400 text-white border-0",
          icon: Clock,
          label: "Pendiente"
        };
      default:
        return {
          className: "bg-gradient-to-r from-slate-400 to-gray-400 text-white border-0",
          icon: Clock,
          label: "Sin Estado"
        };
    }
  };

  const isOverdue =
    task.fecha_limite &&
    new Date(task.fecha_limite) < new Date() &&
    task.estado !== "completada";

  const priorityConfig = getPriorityConfig(task.prioridad);
  const statusConfig = getStatusConfig(task.estado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl border-0 p-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-white">
                  {task.titulo}
                </DialogTitle>
              </div>
              <DialogDescription className="text-blue-100 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Proyecto: {project?.nombre}
              </DialogDescription>
            </div>
            {user?.id === project?.creador_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteTask}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6 space-y-6">
          
          {/* Badges de estado y prioridad */}
          <div className="flex flex-wrap gap-3">
            <Badge className={`${priorityConfig.className} px-3 py-2 rounded-xl font-semibold flex items-center gap-2`}>
              <priorityConfig.icon className="h-4 w-4" />
              {priorityConfig.label}
            </Badge>
            <Badge className={`${statusConfig.className} px-3 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg`}>
              <statusConfig.icon className="h-4 w-4" />
              {statusConfig.label}
            </Badge>
            {isOverdue && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                Tarea Vencida
              </Badge>
            )}
          </div>

          {/* Información principal */}
          <div className="grid gap-6">
            
            {/* Descripción */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Descripción
              </h3>
              <p className="text-slate-700 leading-relaxed">{task.descripcion}</p>
            </div>

            {/* Usuarios asignados */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Equipo Asignado ({task.asignados.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {task.asignados.map((asignment) => (
                  <div
                    key={asignment.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {asignment.usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{asignment.usuario.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fecha límite */}
            {task.fecha_limite && (
              <div className={`p-5 rounded-xl border ${isOverdue ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Calendar className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Fecha Límite</h3>
                    <p className={`text-sm ${isOverdue ? 'text-red-700 font-semibold' : 'text-green-700'}`}>
                      {new Date(task.fecha_limite).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {isOverdue && " (Vencida)"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cambiar estado */}
            {task.asignados.find((a) => a.usuario.id === user?.id) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Actualizar Estado
                </h3>
                <div className="flex flex-wrap gap-3">
                  {task.estado !== "pendiente" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("pendiente")}
                      className="px-4 py-2 rounded-xl border-slate-300 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pendiente
                    </Button>
                  )}
                  {task.estado !== "en_progreso" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("en_progreso")}
                      className="px-4 py-2 rounded-xl border-blue-300 hover:bg-blue-50 font-semibold transition-colors text-blue-700"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      En Progreso
                    </Button>
                  )}
                  {task.estado !== "completada" && (
                    <Button
                      onClick={() => handleStatusChange("completada")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Documentos adjuntos */}
          {task_files.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                Documentos Adjuntos ({task_files.length})
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {task_files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon className="text-blue-500 h-4 w-4" />
                      <span className="truncate max-w-[300px]">{file.nombre_original}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dowloadFile(file.nombre_archivo, file.nombre_original)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}


          <Separator className="my-6" />

          {/* Sección de comentarios */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-800">
                Comentarios ({task.comentarios.length})
              </h3>
            </div>

            {/* Formulario de comentario */}
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                placeholder="Comparte tus ideas, actualizaciones o preguntas sobre esta tarea..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base placeholder-slate-400 resize-none"
              />

              <div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setFiles(Array.from(e.target.files));
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {files.length > 0 && (
                  <ul className="text-sm text-slate-600 space-y-1 mt-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      Publicar Comentario
                    </div>
                  )}
                </Button>
              </div>
            </form>


            {/* Lista de comentarios */}
            <div className="space-y-4">
              {task.comentarios.map((comment) => (
                <Card key={comment.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {comment.usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 text-sm">
                            {comment.usuario.email}
                          </span>
                          <p className="text-xs text-slate-500">
                            {new Date(comment.fecha_creacion).toLocaleString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <p className="text-slate-700 leading-relaxed">{comment.contenido}</p>

                    {/* Archivos adjuntos */}
                    {comment.archivos.length > 0 && (
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-5 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-slate-600" />
                          Documentos Adjuntos ({comment.archivos.length})
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {comment.archivos.map((file) => (
                            <li key={file.id} className="flex items-center justify-between gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 truncate">
                                <FileIcon className="text-blue-500 h-4 w-4" />
                                <span className="truncate max-w-[300px]">{file.nombre_original}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dowloadFile(file.nombre_archivo, file.nombre_original)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <DownloadIcon className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </CardContent>
                </Card>
              ))}
              
              {task.comentarios.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">¡Inicia la conversación!</p>
                  <p className="text-slate-500 text-sm">
                    Sé el primero en comentar y compartir tus ideas sobre esta tarea
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
