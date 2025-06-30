import { useAuth } from "@/contexts/auth-context";
import { Project, Task, User } from "@/types";
import { useEffect, useState } from "react";

export default function useTask(id: number) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [assignedTo, setAssignedTo] = useState<User[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!token) return;
    const headers = {
      authorization: `Bearer ${token}`,
    };

    fetch(`/api/tareas/${id}`, { headers })
      .then((r) => r.json())
      .then((result) => {
        const {
          tarea,
          asignados,
          proyecto,
        }: { tarea: Task; asignados: User[]; proyecto: Project } = result;

        setAssignedTo(asignados);
        setProject(proyecto);
        setTask(tarea);

        setLoading(false);
      });
  }, [id]);

  return { loading, task, assignedTo, project };
}
