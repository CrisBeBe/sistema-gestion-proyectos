import { IncomingMessage } from 'http';
export interface ProyectosFormFields {
    nombre: string;
    descripcion: string;
    fecha_limite: string;
    presupuesto: string;
  }

export interface ProyectosFormFiles {
    archivos: File[]
}

export async function parseForm (form: FormData): Promise<{ fields: ProyectosFormFields; files: ProyectosFormFiles }> {
    const nombre = form.get("nombre")!.toString();
    const descripcion = form.get("descripcion")!.toString();
    const fecha_limite = form.get("fecha_limite")!.toString();
    const presupuesto = form.get("presupuesto")!.toString();
    const archivos = form.getAll("archivos") as File[];

    return {
        fields: {
            nombre, descripcion, fecha_limite, presupuesto
        },
        files: {archivos}
    }
    
};
