"use client";

import type React from "react";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles, Target, Users } from "lucide-react";

/**
 
El componente `CreateProjectDialog` que muestra un diálogo modal para crear un nuevo proyecto en la aplicación. Utiliza estados locales para controlar la apertura del diálogo, los valores del título y descripción del proyecto, y el estado de carga. Al enviar el formulario:

* Llama a la función `createProject` desde el contexto de aplicación para crear el proyecto.
* Muestra notificaciones de éxito o error usando el hook `useToast`.
* Reinicia los campos del formulario y cierra el diálogo al éxito.
* El componente utiliza botones y campos de entrada personalizados para construir el formulario y la interfaz del diálogo.

Su propósito es proporcionar una interfaz para que los usuarios creen nuevos proyectos colaborativos fácilmente.

 */
export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { createProject } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProject(title, description);
      toast({
        title: "Proyecto creado",
        description: "Tu proyecto ha sido creado exitosamente.",
      });
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl shadow-2xl border-0 max-h-[80vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 -m-6 mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-white mb-2">
              Crear Nuevo Proyecto
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-base">
              Inicia un nuevo proyecto colaborativo y alcanza tus objetivos académicos
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Indicadores de beneficios */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-xl">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Colaborativo</div>
              <div className="text-xs text-slate-600">Invita a tu equipo</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-xl">
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Organizado</div>
              <div className="text-xs text-slate-600">Gestión inteligente</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
              Título del Proyecto
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Proyecto de Investigación en IA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base placeholder-slate-400"
            />
            <p className="text-xs text-slate-500">
              Elige un nombre descriptivo y atractivo para tu proyecto
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
              Descripción
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe los objetivos, metodología y resultados esperados de tu proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base placeholder-slate-400 resize-none"
            />
            <p className="text-xs text-slate-500">
              Una descripción clara ayudará a atraer colaboradores ideales
            </p>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando proyecto...
                </div>
              ) : (
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Mensaje de motivación */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <p className="text-sm text-slate-700 text-center">
            <strong className="text-blue-700">¡Tip profesional!</strong> Los proyectos con descripciones detalladas tienen un{" "}
            <span className="text-purple-700 font-semibold">300% más</span> de probabilidad de encontrar colaboradores activos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}