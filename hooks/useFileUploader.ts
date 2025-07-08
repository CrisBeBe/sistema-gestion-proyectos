import { useRef } from "react";

export default function useFileUploader() {
    const ref = useRef<HTMLInputElement>(null);
    

    return {inputRef: ref}
}
