"use client";

import { ImageUp } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import type { ImageMimeType } from "@/lib/image/detect-image-type";
import { formatFileSize } from "@/lib/image/format-file-size";
import { formatTypeList, getAcceptAttribute } from "@/lib/image/image-formats";
import { MAX_FILE_SIZE } from "@/lib/image/image-limits";
import { getToolHref } from "@/lib/tools";

import { PreviewCard } from "./preview-card";
import { ToolActionArea, ToolPreviewArea } from "./tool-page-layout";
import type { ImageTool } from "./use-image-tool";
import { useWindowFileDrop } from "./use-window-file-drop";

type ImageToolViewProps = {
  tool: ImageTool;
  /** Tipos aceitos (o `accepts` da ferramenta). */
  accepts: readonly ImageMimeType[];
  /** Formato de saída para o nome acessível do download (ex.: "WebP"). */
  outputLabel: string;
  /** Texto alternativo da prévia (ex.: "Prévia da imagem convertida"). */
  previewAlt: string;
  /** Opções da ferramenta (ex.: qualidade), abaixo do botão. */
  controls?: ReactNode;
};

/**
 * A parte comum de toda ferramenta de imagem: botão "Escolher imagem",
 * arrastar e soltar, estados (processando, erro), prévia com download e
 * tamanho antes e depois. Encaixa nas áreas do ToolPageLayout.
 */
export function ImageToolView({
  tool,
  accepts,
  outputLabel,
  previewAlt,
  controls,
}: ImageToolViewProps) {
  const { state, selectFile } = tool;
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string>();

  function handleFiles(files: File[]) {
    setNotice(
      files.length > 1
        ? `Você escolheu ${files.length} arquivos: abrimos só o primeiro (uma imagem por vez).`
        : undefined,
    );
    void selectFile(files[0]);
  }

  const isDragging = useWindowFileDrop(handleFiles);
  const openPicker = () => inputRef.current?.click();

  const result =
    state.status === "done" || state.status === "processing"
      ? state.result
      : undefined;
  const isBusy = state.status === "checking" || state.status === "processing";
  const hasFile = state.status !== "idle";

  return (
    <>
      <ToolActionArea>
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptAttribute(accepts)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          data-testid="image-input"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            // Permite escolher o mesmo arquivo de novo.
            event.target.value = "";
            if (files.length > 0) handleFiles(files);
          }}
        />
        <Button
          size="lg"
          className="w-full sm:w-auto sm:self-start"
          onClick={openPicker}
        >
          <ImageUp className="size-5" aria-hidden="true" />
          {hasFile ? "Escolher outra imagem" : "Escolher imagem"}
        </Button>
        <p className="text-sm text-muted">
          {formatTypeList(accepts)} até {formatFileSize(MAX_FILE_SIZE)}. A
          imagem não sai do seu aparelho, e os metadados (como a localização)
          são removidos.
        </p>

        {controls}

        {isBusy && (
          <p className="flex items-center gap-2 text-sm" role="status">
            <Spinner size="sm" />
            {state.status === "checking"
              ? "Conferindo a imagem…"
              : "Processando a imagem…"}
          </p>
        )}
        {notice && <Alert variant="info">{notice}</Alert>}
        {state.status === "error" && (
          <Alert variant="error" title="Não deu para usar essa imagem">
            <p>{state.error.message}</p>
            {state.error.suggestedTool?.status === "available" && (
              <p className="mt-1">
                <Link
                  href={getToolHref(state.error.suggestedTool)}
                  className="font-medium underline underline-offset-4"
                >
                  Abrir {state.error.suggestedTool.name}
                </Link>
              </p>
            )}
          </Alert>
        )}
      </ToolActionArea>

      <ToolPreviewArea hiddenOnMobile={!result && !isBusy}>
        <div
          data-dragging={isDragging || undefined}
          className={cn(
            "rounded-card transition-shadow",
            isDragging &&
              "ring-4 ring-ring ring-offset-4 ring-offset-background",
          )}
        >
          <PreviewCard
            image={result && { src: result.url, alt: previewAlt }}
            download={
              result && {
                href: result.url,
                fileName: result.fileName,
                label: `Baixar imagem em ${outputLabel}`,
              }
            }
            sizes={
              result && hasFile && "file" in state && state.file
                ? { before: state.file.size, after: result.blob.size }
                : undefined
            }
            busy={isBusy}
            emptyContent={
              <button
                type="button"
                onClick={openPicker}
                className="rounded-control bg-surface px-4 py-3 text-sm text-muted shadow-card hover:text-foreground"
              >
                {isDragging
                  ? "Solte a imagem para abrir"
                  : "Arraste uma imagem para cá ou clique para escolher"}
              </button>
            }
          />
        </div>
      </ToolPreviewArea>
    </>
  );
}
