"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

/**
 
El componente `CreateProjectDialog` que muestra un diálogo modal para crear un nuevo proyecto en la aplicación. Utiliza estados locales para controlar la apertura del diálogo, los valores del título y descripción del proyecto, y el estado de carga. Al enviar el formulario:

* Llama a la función `createProject` desde el contexto de aplicación para crear el proyecto.
* Muestra notificaciones de éxito o error usando el hook `useToast`.
* Reinicia los campos del formulario y cierra el diálogo al éxito.
* El componente utiliza botones y campos de entrada personalizados para construir el formulario y la interfaz del diálogo.

Su propósito es proporcionar una interfaz para que los usuarios creen nuevos proyectos colaborativos fácilmente.

 */
export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const { createProject } = useApp()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createProject(title, description)
      toast({
        title: "Proyecto creado",
        description: "Tu proyecto ha sido creado exitosamente.",
      })
      setTitle("")
      setDescription("")
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>Crea un nuevo proyecto para colaborar con otros estudiantes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto</Label>
            <Input
              id="title"
              placeholder="Ej: Proyecto de Investigación"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente el proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
