"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn, formatFileSize, getFileIcon } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface CreateProjectDialogProps {
  onProjectCreated?: () => void;
  createProject: (name: string, description: string, due_date: Date, presupuesto: number, files: File[]) => void
}

export function CreateProjectDialog({ onProjectCreated, createProject }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [files, setFiles] = useState<File[]>([])
  const { toast } = useToast()
  const { token } = useAuth()

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    presupuesto: "",
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proyecto es requerido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create project
      createProject(formData.nombre, formData.descripcion, date || new Date(), parseFloat(formData.presupuesto), files)

      toast({
        title: "Éxito",
        description: "Proyecto creado correctamente",
      })

      // Reset form
      setFormData({ nombre: "", descripcion: "", presupuesto: "" })
      setDate(undefined)
      setFiles([])
      setOpen(false)
      onProjectCreated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Proyecto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Proyecto *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ingresa el nombre del proyecto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el proyecto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presupuesto">Presupuesto</Label>
              <Input
                id="presupuesto"
                type="number"
                step="0.01"
                min="0"
                value={formData.presupuesto}
                onChange={(e) => setFormData((prev) => ({ ...prev, presupuesto: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Límite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Archivos del Proyecto</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-500">Seleccionar archivos</span>
                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Archivos que todos los miembros podrán ver</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Archivos seleccionados:</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
