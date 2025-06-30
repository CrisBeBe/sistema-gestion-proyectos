"use client";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/types";
import { ArrowLeft, CheckSquare, Loader, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { InviteMemberDialog } from "./invite-member-dialog";

interface ProjectViewProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const { user, token } = useAuth();
  const { projects, tasks } = useApp();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);

  console.log({ projectId });

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.proyecto_id === projectId);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const todoTasks = projectTasks.filter((t) => t.estado === "pendiente");
  const inProgressTasks = projectTasks.filter(
    (t) => t.estado === "en_progreso"
  );
  const completedTasks = projectTasks.filter((t) => t.estado === "completada");
  const isOwner = user && project && user.id === project.creador_id;

  useEffect(() => {
    const headers: any = {};

    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    fetch(`/api/proyectos/${projectId}/miembros`, { headers })
      .then((res) => res.json())
      .then((miembros) => {
        setMembers(miembros);
        setLoading(false);
      });
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.titulo}</h1>
          <p className="text-muted-foreground">{project.descripcion}</p>
        </div>
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <InviteMemberDialog projectId={projectId} />
              <CreateTaskDialog projectId={projectId} />
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{members.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Tareas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{projectTasks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                {projectTasks.length > 0
                  ? Math.round(
                      (completedTasks.length / projectTasks.length) * 100
                    )
                  : 0}
                %
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Tablero</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Por Hacer
                  <Badge variant="secondary">{todoTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {todoTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay tareas pendientes
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  En Progreso
                  <Badge variant="secondary">{inProgressTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {inProgressTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay tareas en progreso
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Completadas
                  <Badge variant="secondary">{completedTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay tareas completadas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {projectTasks.map((task) => (
              <TaskCard key={task.id} task={task} showProject={false} />
            ))}
            {projectTasks.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay tareas</h3>
                  {isOwner ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        Crea la primera tarea para este proyecto
                      </p>
                      <CreateTaskDialog projectId={projectId} />
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Miembros del Proyecto</CardTitle>
              <CardDescription>
                Usuarios que colaboran en este proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <div className="flex-1">
                    <Loader className="animate-spin" />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {members[0].nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{members[0].nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {members[0].email}
                      </p>
                    </div>
                    <Badge>Propietario</Badge>
                  </div>

                  {members.slice(1).map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                        {member.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <Badge variant="secondary">Miembro</Badge>
                    </div>
                  ))}

                  {members.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Solo tú eres miembro de este proyecto. ¡Invita a otros
                      estudiantes!
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
