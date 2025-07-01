"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import useProject from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { TaskPriority, User } from "@/types";



import { Plus, CheckSquare, Clock, Users, AlertTriangle, Target, Calendar, Sparkles } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

interface CreateTaskDialogProps {
  projectId: number;
}

/**   
 * Componente `CreateTaskDialog` que permite crear una nueva tarea en un proyecto.
* Usa estados locales para manejar título, descripción, prioridad, fecha límite, miembros asignados y estado de carga.
* Muestra un formulario dentro de un diálogo modal para ingresar los datos de la tarea.
* Al enviar el formulario, llama a `createTask` del contexto de la app para guardar la tarea.
* Muestra notificaciones de éxito o error usando `toast`.
* Permite asignar la tarea a miembros del proyecto mediante checkboxes.
* Si no se asigna a nadie, la tarea se asigna automáticamente al usuario actual.
* Incluye campos de prioridad con opciones baja, media y alta.
* Contiene botones para cancelar o crear la tarea.

*/

export function CreateTaskDialog({ projectId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { createTask } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  const { members, project } = useProject(projectId);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTask(
        projectId,
        {
          proyecto_id: projectId,
          titulo: title,
          descripcion: description,
          prioridad: priority,
          estado: "pendiente",
          fecha_limite: dueDate || null,
          creador_id: (user as User).id,
        },
        selectedMembers.length > 0 ? selectedMembers : [(user as User).id]
      );

      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente.",
      });

      setTitle("");
      setDescription("");
      setPriority("media");
      setDueDate("");
      setSelectedMembers([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case "alta":
        return { color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle, label: "Alta Prioridad" };
      case "media":
        return { color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock, label: "Prioridad Media" };
      case "baja":
        return { color: "text-green-600", bg: "bg-green-50", icon: CheckSquare, label: "Baja Prioridad" };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", icon: Clock, label: "Prioridad Media" };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 -m-6 mb-6"> 
          <div className="flex items-center justify-center mb-3">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-white mb-2">
              Crear Nueva Tarea
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-base">
              Define una nueva tarea para mantener el proyecto organizado y en progreso
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Indicadores de características */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-xl">
            <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Objetivos</div>
              <div className="text-xs text-slate-600">Claros y medibles</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-teal-50 rounded-xl">
            <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Asignación</div>
              <div className="text-xs text-slate-600">Responsabilidades</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-xl">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Plazos</div>
              <div className="text-xs text-slate-600">Seguimiento</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
              Título de la Tarea
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Investigar metodología de análisis de datos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-base placeholder-slate-400"
            />
            <p className="text-xs text-slate-500">
              Un título descriptivo ayuda a entender el propósito de la tarea
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
              Descripción
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe los pasos específicos, entregables esperados y criterios de éxito..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl text-base placeholder-slate-400 resize-none"
            />
            <p className="text-xs text-slate-500">
              Detalles claros evitan malentendidos y mejoran la ejecución
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="priority" className="text-sm font-semibold text-slate-700 flex items-center">
                <priorityConfig.icon className={`h-4 w-4 mr-1 ${priorityConfig.color}`} />
                Prioridad
              </Label>
              <Select
                value={priority}
                onValueChange={(value: TaskPriority) => setPriority(value)}
              >
                <SelectTrigger className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl h-12">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="baja" className="rounded-lg">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 text-green-600 mr-2" />
                      Baja
                    </div>
                  </SelectItem>
                  <SelectItem value="media" className="rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      Media
                    </div>
                  </SelectItem>
                  <SelectItem value="alta" className="rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      Alta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-slate-700 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                Fecha Límite
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 flex items-center">
              <Users className="h-4 w-4 mr-1 text-purple-600" />
              Asignar Miembros
            </Label>
            <div className="space-y-3 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <Checkbox
                    id={member.id.toString()}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers((prev) => [...prev, member.id]);
                      } else {
                        setSelectedMembers((prev) =>
                          prev.filter((id) => id !== member.id)
                        );
                      }
                    }}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor={member.id.toString()} className="text-sm font-medium text-slate-900 cursor-pointer">
                      {member.nombre}
                    </Label>
                    {member.id === project?.creador_id && (
                      <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full font-medium">
                        Propietario
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-slate-700">
                <strong className="text-emerald-700">Asignación inteligente:</strong> Si no seleccionas miembros específicos, 
                la tarea se asignará automáticamente a ti para comenzar de inmediato.
              </p>
            </div>
          </div>

          {/* Vista previa de configuración */}
          <div className={`p-4 ${priorityConfig.bg} rounded-xl border-l-4 border-l-${priority === 'alta' ? 'red' : priority === 'media' ? 'yellow' : 'green'}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Vista Previa de la Tarea</h4>
                <div className="flex items-center mt-1">
                  <priorityConfig.icon className={`h-4 w-4 mr-2 ${priorityConfig.color}`} />
                  <span className={`text-sm font-medium ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                  {dueDate && (
                    <span className="ml-4 text-sm text-slate-600">
                      • Vence: {new Date(dueDate).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Asignados</div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedMembers.length || 1} miembro{(selectedMembers.length || 1) > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-8 py-3 rounded-xl font-semibold border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !description.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando tarea...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Crear Tarea
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Mensaje motivacional */}
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <p className="text-sm text-slate-700 text-center">
            <strong className="text-emerald-700">¡Productividad máxima!</strong> Las tareas bien definidas aumentan la 
            <span className="text-teal-700 font-semibold"> eficiencia del equipo en un 250%</span> y reducen significativamente los tiempos de entrega.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}