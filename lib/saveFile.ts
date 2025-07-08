import {writeFile} from "fs/promises"

export interface SaveFileResult {
    nombre_archivo: string;
    nombre_original: string;
    tipo_archivo: string;
    tamaño: number;
    ruta_archivo: string;
}
export async function saveFile(file: File): Promise<SaveFileResult | null> {
    const nombre_original = file.name;
    const nombre_archivo = `${Date.now()}-${Math.round(Math.random() * 100000)}`
    const tipo_archivo = file.type;
    const tamaño = file.size
    const ruta_archivo = `./uploads/${nombre_archivo}`;
    console.log({ruta_archivo});
    

    try {
        await writeFile(ruta_archivo, Buffer.from(await file.arrayBuffer()));

        return {
            nombre_archivo,
            nombre_original,
            tipo_archivo,
            tamaño,
            ruta_archivo
        }
    } catch(e) {
        console.log(e);
        
        return null;
    }
  }