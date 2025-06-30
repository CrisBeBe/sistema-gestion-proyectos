import { useAuth } from "@/contexts/auth-context";
import { Project, Task, User } from "@/types";
import { useEffect, useState } from "react";

export default function useProject(id: number) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [creator, setCreator] = useState<User | null>();

  useEffect(() => {
    if (!token) return;
    const headers = { authorization: `Bearer ${token}` };

    fetch(`/api/proyectos/${id}`, { headers })
      .then((res) => res.json())
      .then((result) => {
        const {
          proyecto,
          miembros,
          tareas,
        }: { proyecto: Project; miembros: User[]; tareas: Task[] } = result;

        console.log({ result });

        setCreator(miembros.find((u) => u.id == proyecto.creador_id) ?? null);
        setMembers(miembros);
        setTasks(tareas);
        setProject(proyecto);
        setLoading(false);
      });
  }, [token]);

  return { loading, project, members, tasks, creator };
}
