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
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface InviteMemberDialogProps {
  projectId: number;
}

/**
 
El componente `CreateProjectDialog` que muestra un diálogo modal para crear un nuevo proyecto en la aplicación. Utiliza estados locales para controlar la apertura del diálogo, los valores del título y descripción del proyecto, y el estado de carga. Al enviar el formulario:

* Llama a la función `createProject` desde el contexto de aplicación para crear el proyecto.
* Muestra notificaciones de éxito o error usando el hook `useToast`.
* Reinicia los campos del formulario y cierra el diálogo al éxito.
* El componente utiliza botones y campos de entrada personalizados para construir el formulario y la interfaz del diálogo.

Su propósito es proporcionar una interfaz para que los usuarios creen nuevos proyectos colaborativos fácilmente.

 */
export function InviteMemberDialog({ projectId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { inviteToProject } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await inviteToProject(projectId, email);
      if (success) {
        toast({
          title: "Invitación enviada",
          description: "El usuario ha sido invitado al proyecto.",
        });
        setEmail("");
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la invitación.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Miembro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Miembro</DialogTitle>
          <DialogDescription>
            Invita a otro estudiante a colaborar en este proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="estudiante@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
              {loading ? "Enviando..." : "Enviar Invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
