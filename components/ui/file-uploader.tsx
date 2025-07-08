// Componente visual que permite al usuario subir archivos (Modal) 
// Debe recibir una referencia al input de tipo file y un callback para manejar el archivo subido

import { RefObject } from "react";

interface Props {
    inputRef: RefObject<HTMLInputElement>
    onFileUpload: (file: File) => void;
}

// Componente aquí
