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
import { Plus } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Crea una nueva tarea para este proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Tarea</Label>
            <Input
              id="title"
              placeholder="Ej: Investigar metodología"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              value={priority}
              onValueChange={(value: TaskPriority) => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha Límite (Opcional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Asignar a (opcional):</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
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
                  />
                  <Label htmlFor={member.id.toString()} className="text-sm">
                    {member.nombre}{" "}
                    {member.id === project?.creador_id && "(Propietario)"}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Si no seleccionas ningún miembro, la tarea se asignará a ti
              automáticamente.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Tarea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
