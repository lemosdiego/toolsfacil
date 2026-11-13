"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ImageMimeType } from "@/lib/image/detect-image-type";
import {
  ImageProcessingError,
  type EncodedImage,
} from "@/lib/image/encode-image";
import { inspectImageFile } from "@/lib/image/inspect-image-file";
import { takePendingFile } from "@/lib/image/pending-file";
import { disposeImageWorker } from "@/lib/image/process-image";
import {
  processingErrors,
  validateImage,
  type ImageError,
} from "@/lib/image/validate-image";

export type ImageToolResult = EncodedImage & {
  /** URL `blob:` local do resultado (revogada ao trocar e ao sair). */
  url: string;
  fileName: string;
};

export type ImageToolState =
  | { status: "idle" }
  | { status: "checking"; file: File }
  | {
      status: "processing";
      file: File;
      sourceType: ImageMimeType;
      /** Resultado anterior da mesma imagem (ex.: mudou a qualidade). */
      result?: ImageToolResult;
    }
  | {
      status: "done";
      file: File;
      sourceType: ImageMimeType;
      result: ImageToolResult;
    }
  | { status: "error"; file?: File; error: ImageError };

export type ImageToolOptions = {
  /** Tipos reais aceitos (o `accepts` da ferramenta no registro). */
  accepts: readonly ImageMimeType[];
  /** O que a ferramenta faz com a imagem (em geral, `processImage`). */
  process: (file: File, sourceType: ImageMimeType) => Promise<EncodedImage>;
  /** Nome do arquivo baixado (via `getOutputFileName`). */
  getFileName: (file: File) => string;
};

/**
 * Estado de uma ferramenta de imagem: vazio → conferindo → processando →
 * pronto | erro. Cuida da validação, das URLs `blob:` e do Web Worker.
 * Uma escolha nova cancela o resultado da anterior.
 */
export function useImageTool(options: ImageToolOptions) {
  const [state, setState] = useState<ImageToolState>({ status: "idle" });
  const optionsRef = useRef(options);
  const runRef = useRef(0);
  const urlRef = useRef<string | undefined>(undefined);
  const stateRef = useRef(state);

  useEffect(() => {
    optionsRef.current = options;
  });
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = undefined;
  }, []);

  const runProcess = useCallback(
    async (
      run: number,
      file: File,
      sourceType: ImageMimeType,
      previous?: ImageToolResult,
    ) => {
      setState({ status: "processing", file, sourceType, result: previous });
      try {
        const encoded = await optionsRef.current.process(file, sourceType);
        if (run !== runRef.current) return;

        revokeUrl();
        const url = URL.createObjectURL(encoded.blob);
        urlRef.current = url;
        setState({
          status: "done",
          file,
          sourceType,
          result: {
            ...encoded,
            url,
            fileName: optionsRef.current.getFileName(file),
          },
        });
      } catch (error) {
        if (run !== runRef.current) return;
        revokeUrl();
        const code =
          error instanceof ImageProcessingError ? error.code : "encode-failed";
        setState({ status: "error", file, error: processingErrors[code] });
      }
    },
    [revokeUrl],
  );

  /** Confere e processa um arquivo escolhido ou solto. */
  const selectFile = useCallback(
    async (file: File) => {
      const run = ++runRef.current;
      revokeUrl();
      setState({ status: "checking", file });

      const inspection = await inspectImageFile(file);
      if (run !== runRef.current) return;

      const validation = validateImage(inspection, optionsRef.current.accepts);
      if (!validation.ok) {
        setState({ status: "error", file, error: validation.error });
        return;
      }
      await runProcess(run, file, validation.type);
    },
    [revokeUrl, runProcess],
  );

  /** Processa de novo a mesma imagem (ex.: depois de mudar uma opção). */
  const reprocess = useCallback(async () => {
    const current = stateRef.current;
    if (current.status !== "done" && current.status !== "processing") return;
    const run = ++runRef.current;
    await runProcess(run, current.file, current.sourceType, current.result);
  }, [runProcess]);

  /** Volta ao estado vazio. */
  const reset = useCallback(() => {
    runRef.current++;
    revokeUrl();
    setState({ status: "idle" });
  }, [revokeUrl]);

  // Imagem escolhida na home: abre direto, sem nova escolha. A ref guarda o
  // arquivo porque o React (em dev) monta o componente duas vezes, e o
  // store só entrega o arquivo uma vez.
  // undefined: ainda não olhou o store; null: não havia arquivo.
  const pendingRef = useRef<File | null | undefined>(undefined);
  useEffect(() => {
    if (pendingRef.current === undefined) {
      pendingRef.current = takePendingFile() ?? null;
    }
    if (pendingRef.current) void selectFile(pendingRef.current);
  }, [selectFile]);

  // Ao sair da página: libera a URL e encerra o worker.
  useEffect(
    () => () => {
      runRef.current++;
      revokeUrl();
      disposeImageWorker();
    },
    [revokeUrl],
  );

  return { state, selectFile, reprocess, reset };
}

export type ImageTool = ReturnType<typeof useImageTool>;
