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
import { UserPlus, Users, Mail, Sparkles, Shield } from "lucide-react";
import { useState } from "react";

interface InviteMemberDialogProps {
  projectId: number;
}

/**
 
El componente `InviteMemberDialog` que muestra un diálogo modal para invitar miembros a un proyecto. Utiliza estados locales para controlar la apertura del diálogo, el valor del email y el estado de carga. Al enviar el formulario:

* Llama a la función `inviteToProject` desde el contexto de aplicación para enviar la invitación.
* Muestra notificaciones de éxito o error usando el hook `useToast`.
* Reinicia el campo del email y cierra el diálogo al éxito.
* El componente utiliza botones y campos de entrada personalizados para construir el formulario y la interfaz del diálogo.

Su propósito es proporcionar una interfaz para que los usuarios inviten colaboradores a sus proyectos.

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
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Miembro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 -m-6 mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-white mb-2">
              Invitar Colaborador
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-base">
              Amplía tu equipo e impulsa el éxito de tu proyecto académico
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Beneficios de la colaboración */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-xl">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Más Ideas</div>
              <div className="text-xs text-slate-600">Perspectivas diversas</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-xl">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Más Productivo</div>
              <div className="text-xs text-slate-600">Trabajo en equipo</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-slate-600" />
              Correo Electrónico del Estudiante
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="compañero@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base placeholder-slate-400"
            />
            <p className="text-xs text-slate-500 flex items-center">
              <Shield className="h-3 w-3 mr-1 text-green-500" />
              La invitación se enviará de forma segura y privada
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">¿Qué pasará después?</h4>
            <ul className="space-y-1 text-xs text-slate-600">
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                El estudiante recibirá una invitación por correo
              </li>
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                Podrá aceptar o rechazar la invitación
              </li>
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                Una vez aceptada, tendrá acceso completo al proyecto
              </li>
            </ul>
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
              disabled={loading || !email.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando invitación...
                </div>
              ) : (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Mensaje motivacional */}
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <p className="text-sm text-slate-700 text-center">
            <strong className="text-green-700">¡Dato curioso!</strong> Los proyectos colaborativos tienen un{" "}
            <span className="text-blue-700 font-semibold">85% más</span> de probabilidad de completarse exitosamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}