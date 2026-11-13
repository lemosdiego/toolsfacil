"use client";

import { useEffect, useRef, useState } from "react";

function hasFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes("Files") ?? false;
}

/**
 * Aceita arquivo solto em qualquer parte da página (e evita que o navegador
 * abra o arquivo e saia da ferramenta). Devolve se há um arquivo sendo
 * arrastado, para destacar a área da prévia. Só vale no desktop: no
 * celular não existe arrastar arquivo.
 */
export function useWindowFileDrop(onDrop: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    onDropRef.current = onDrop;
  });

  useEffect(() => {
    // dragenter/dragleave disparam em cada elemento filho: conta a profundidade.
    let depth = 0;

    function handleDragEnter(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth++;
      setIsDragging(true);
    }
    function handleDragOver(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    }
    function handleDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    }
    function handleDrop(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setIsDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) onDropRef.current(files);
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return isDragging;
}
