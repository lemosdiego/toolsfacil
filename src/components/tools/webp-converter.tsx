"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { canEncode } from "@/lib/image/can-encode";
import { getOutputFileName } from "@/lib/image/output-file-name";
import { processImage } from "@/lib/image/process-image";
import { getToolBySlug } from "@/lib/tools";

import { ImageToolView } from "./image-tool-view";
import { useImageTool } from "./use-image-tool";

/** Qualidade inicial: reduz bastante o tamanho sem diferença visível. */
export const DEFAULT_WEBP_QUALITY = 80;

/** Espera parar de mexer no controle antes de converter de novo. */
const QUALITY_DEBOUNCE_MS = 350;

// PNG e JPG para WebP aceitam os mesmos formatos (ver tools.ts).
const accepts = getToolBySlug("png-para-webp")?.accepts ?? [];

/**
 * Ilha das ferramentas PNG para WebP e JPG para WebP: a conversão é a mesma,
 * as páginas só mudam o texto. Converte no Web Worker, com controle de
 * qualidade e aviso quando o WebP sai maior que o original.
 */
export function WebpConverter() {
  const [quality, setQuality] = useState(DEFAULT_WEBP_QUALITY);
  const qualityRef = useRef(DEFAULT_WEBP_QUALITY);

  const tool = useImageTool({
    accepts,
    process: async (file) =>
      processImage(file, {
        type: "image/webp",
        quality: qualityRef.current / 100,
        // Safari: o canvas não gera WebP, então entra o codificador WASM.
        encoder: (await canEncode("image/webp")) ? "canvas" : "wasm",
      }),
    getFileName: (file) => getOutputFileName(file.name, { extension: "webp" }),
  });
  const { state, reprocess } = tool;

  // Converte de novo quando a pessoa para de mexer na qualidade.
  useEffect(() => {
    if (quality === qualityRef.current) return;
    const timer = setTimeout(() => {
      qualityRef.current = quality;
      void reprocess();
    }, QUALITY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [quality, reprocess]);

  const grewBigger =
    state.status === "done" && state.result.blob.size >= state.file.size;

  return (
    <ImageToolView
      tool={tool}
      accepts={accepts}
      outputLabel="WebP"
      previewAlt="Prévia da imagem convertida para WebP"
      controls={
        <>
          <div className="flex flex-col gap-2 sm:max-w-sm">
            <div className="flex items-baseline justify-between text-sm">
              <label htmlFor="webp-quality" className="font-medium">
                Qualidade
              </label>
              <output
                htmlFor="webp-quality"
                className="text-muted tabular-nums"
              >
                {quality}
              </output>
            </div>
            <input
              id="webp-quality"
              type="range"
              min={50}
              max={100}
              step={1}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              aria-describedby="webp-quality-hint"
              className="h-11 w-full cursor-pointer accent-primary"
            />
            <p id="webp-quality-hint" className="text-sm text-muted">
              Menor qualidade, arquivo mais leve. 80 costuma não ter diferença
              visível.
            </p>
          </div>
          {grewBigger && (
            <Alert variant="info" title="O WebP ficou maior que o original">
              Acontece com imagens pequenas ou já otimizadas. Você pode baixar
              mesmo assim ou diminuir a qualidade.
            </Alert>
          )}
        </>
      }
    />
  );
}
