"use client";

import { ImageUp, RotateCcw } from "lucide-react";
import { useState } from "react";

import { PreviewCard } from "@/components/tools/preview-card";
import {
  ToolActionArea,
  ToolPreviewArea,
} from "@/components/tools/tool-page-layout";
import { Button } from "@/components/ui/button";

/* Imagem de exemplo embutida (nada é carregado de fora). */
const SAMPLE_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><rect x="40" y="30" width="320" height="240" rx="24" fill="url(#g)"/><circle cx="140" cy="120" r="34" fill="#fef3c7"/><path d="M60 250l90-90 60 60 50-40 80 70z" fill="#1e3a8a" opacity=".55"/></svg>`,
  );

/**
 * Ilha de exemplo do styleguide: só alterna os dois estados da prévia.
 * O envio e o processamento reais entram na fase 07.
 */
export function ExampleTool() {
  const [hasImage, setHasImage] = useState(false);

  return (
    <>
      <ToolActionArea>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setHasImage(true)}
          >
            <ImageUp className="size-5" aria-hidden="true" />
            Escolher imagem
          </Button>
          {hasImage && (
            <Button variant="ghost" onClick={() => setHasImage(false)}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Voltar ao estado vazio
            </Button>
          )}
        </div>
        <p className="text-sm text-muted">
          PNG até 20 MB. A imagem não sai do seu aparelho.
        </p>
      </ToolActionArea>

      <ToolPreviewArea hiddenOnMobile={!hasImage}>
        {hasImage ? (
          <PreviewCard
            image={{ src: SAMPLE_IMAGE, alt: "Prévia da imagem convertida" }}
            download={{
              href: SAMPLE_IMAGE,
              fileName: "exemplo.svg",
              label: "Baixar imagem em WebP",
            }}
            sizes={{ before: 1_258_291, after: 348_160 }}
          />
        ) : (
          <PreviewCard />
        )}
      </ToolPreviewArea>
    </>
  );
}
