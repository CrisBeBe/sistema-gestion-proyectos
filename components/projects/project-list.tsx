"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import {
  Calendar,
  CheckCircleIcon,
  FolderOpen,
  MoreHorizontal,
  Users,
  Crown,
  Sparkles,
  Eye,
  Trash2,
  Plus,
  BookOpen,
  Target,
} from "lucide-react";
import { useEffect } from "react";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectListProps {
  onProjectSelect: (projectId: number) => void;
}

/**  
  el componente `ProjectList`, que muestra la lista de proyectos del usuario dentro de la aplicación. Este componente:

- Recibe una función `onProjectSelect` para manejar la selección de un proyecto.
- Obtiene datos de proyectos, el usuario actual y métodos del contexto de aplicación.
- Muestra cada proyecto en una tarjeta (`Card`) con información como título, descripción, fechas de creación y actualización, y un distintivo que indica si el usuario es propietario o colaborador.
- Incluye un menú desplegable en cada proyecto con opciones para ver o eliminar el proyecto (esta última solo disponible para el propietario).
- Utiliza el componente `CreateProjectDialog` para permitir crear nuevos proyectos.
- Si no hay proyectos, muestra un mensaje informativo y un botón para crear un proyecto.

Su propósito es proporcionar una vista interactiva para gestionar y visualizar los proyectos existentes del usuario.
*/
export function ProjectList({ onProjectSelect }: ProjectListProps) {
  const { user, token } = useAuth();
  const { projects, deleteProject } = useApp();

  const handleDelete = async (projectId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      await deleteProject(projectId);
    }
  };

  useEffect(() => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
  }, [projects]);

  return (
    <div className="space-y-8">
      {/* Header con gradiente mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl text-white">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Mis Proyectos</h2>
                <p className="text-blue-100 text-lg">
                  Gestiona y colabora en tus proyectos estudiantiles
                </p>
              </div>
            </div>
            
            {/* Stats rápidas */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-200" />
                <span className="text-blue-100 font-medium">
                  {projects.length} {projects.length === 1 ? 'Proyecto' : 'Proyectos'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-300" />
                <span className="text-blue-100 font-medium">
                  {projects.filter(p => p.creador_id === user?.id).length} Propios
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-300" />
                <span className="text-blue-100 font-medium">
                  {projects.filter(p => p.creador_id !== user?.id).length} Colaborando
                </span>
              </div>
            </div>
          </div>
          <CreateProjectDialog />
        </div>
      </div>

      {/* Grid de proyectos mejorado */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.02] bg-white rounded-2xl overflow-hidden"
          >
            {/* Header de la card con gradiente sutil */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      project.creador_id === user?.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-green-500 to-teal-500'
                    }`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {project.titulo}
                      </CardTitle>
                      <Badge
                        className={`mt-1 ${
                          project.creador_id === user?.id
                            ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                            : "bg-gradient-to-r from-green-100 to-teal-100 text-green-700 border-green-200"
                        } font-semibold px-3 py-1 rounded-full border`}
                      >
                        {project.creador_id === user?.id ? (
                          <div className="flex items-center space-x-1">
                            <Crown className="h-3 w-3" />
                            <span>Propietario</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Colaborador</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:shadow-md rounded-xl"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-0">
                      <DropdownMenuItem
                        onClick={() => onProjectSelect(project.id)}
                        className="rounded-lg hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2 text-blue-600" />
                        Ver Proyecto
                      </DropdownMenuItem>
                      {project.creador_id === user?.id && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardDescription className="line-clamp-3 text-slate-600 text-sm leading-relaxed mt-3">
                  {project.descripcion}
                </CardDescription>
              </CardHeader>
            </div>

            <CardContent className="space-y-4">
              {/* Información de fechas mejorada */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Última Actualización</div>
                    <div className="text-xs text-slate-600">
                      {new Date(project.fecha_actualizacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Fecha de Creación</div>
                    <div className="text-xs text-slate-600">
                      {new Date(project.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acción mejorado */}
              <Button
                onClick={() => onProjectSelect(project.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Proyecto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío mejorado */}
      {projects.length === 0 && (
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Comienza tu Primer Proyecto!</h3>
              <p className="text-slate-600 text-lg">
                Crea tu primer proyecto para comenzar a colaborar con otros estudiantes
              </p>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Beneficios de crear proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Organiza Ideas</div>
                  <div className="text-sm text-slate-600">Estructura tus pensamientos</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Colabora</div>
                  <div className="text-sm text-slate-600">Trabaja en equipo</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Alcanza Metas</div>
                  <div className="text-sm text-slate-600">Logra tus objetivos</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <CreateProjectDialog />
            </div>

            {/* Mensaje motivacional */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p className="text-sm text-slate-700 text-center">
                <strong className="text-blue-700">¡Dato inspirador!</strong> Los estudiantes que organizan sus proyectos tienen un{" "}
                <span className="text-purple-700 font-semibold">90% más</span> de probabilidad de completarlos exitosamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}