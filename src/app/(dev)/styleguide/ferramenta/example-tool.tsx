"use client";

import { ImageToolView } from "@/components/tools/image-tool-view";
import { useImageTool } from "@/components/tools/use-image-tool";
import type { ImageMimeType } from "@/lib/image/detect-image-type";
import { getOutputFileName } from "@/lib/image/output-file-name";
import { processImage } from "@/lib/image/process-image";

const accepts: readonly ImageMimeType[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

/**
 * Ilha de exemplo do styleguide, com o fluxo real: escolher (ou soltar),
 * conferir, regravar em PNG no Web Worker e baixar. Serve de bancada para
 * os testes E2E das peças das ferramentas.
 */
export function ExampleTool() {
  const tool = useImageTool({
    accepts,
    process: (file) => processImage(file, { type: "image/png" }),
    getFileName: (file) =>
      getOutputFileName(file.name, { extension: "png", suffix: "exemplo" }),
  });

  return (
    <ImageToolView
      tool={tool}
      accepts={accepts}
      outputLabel="PNG"
      previewAlt="Prévia da imagem convertida"
    />
  );
}
