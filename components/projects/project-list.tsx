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
} from "lucide-react";
import { useEffect } from "react";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectListProps {
  onProjectSelect: (projectId: number) => void;
}

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">
            Gestiona y colabora en tus proyectos estudiantiles
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{project.titulo}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onProjectSelect(project.id)}
                    >
                      Ver Proyecto
                    </DropdownMenuItem>
                    {project.creador_id === user?.id && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="line-clamp-2">
                {project.descripcion}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>
                    Última Actualización:{" "}
                    {new Date(project.fecha_actualizacion).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Creado el{" "}
                    {new Date(project.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      project.creador_id === user?.id ? "default" : "secondary"
                    }
                  >
                    {project.creador_id === user?.id
                      ? "Propietario"
                      : "Colaborador"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProjectSelect(project.id)}
                  >
                    Ver Proyecto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes proyectos</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer proyecto para comenzar a colaborar con otros
              estudiantes
            </p>
            <CreateProjectDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
