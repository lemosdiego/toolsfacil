"use client";

import { ImageUp } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { useWindowFileDrop } from "@/components/tools/use-window-file-drop";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import type { ImageMimeType } from "@/lib/image/detect-image-type";
import { formatFileSize } from "@/lib/image/format-file-size";
import {
  formatTypeList,
  getAcceptAttribute,
  imageFormats,
} from "@/lib/image/image-formats";
import { MAX_FILE_SIZE } from "@/lib/image/image-limits";
import { inspectImageFile } from "@/lib/image/inspect-image-file";
import { setPendingFile } from "@/lib/image/pending-file";
import { validateImage, type ImageError } from "@/lib/image/validate-image";
import {
  getActionsForFileType,
  getAllAcceptedTypes,
  getToolHref,
  type Tool,
} from "@/lib/tools";

type RouterState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ready"; file: File; type: ImageMimeType; actions: Tool[] }
  | { status: "error"; error: ImageError };

const acceptedTypes = getAllAcceptedTypes();

/** Clique comum (sem Ctrl, Cmd, Shift ou botão do meio): navegação na mesma aba. */
function isPlainClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Topo da home: a pessoa escolhe (ou arrasta) a imagem, a home confere o
 * tipo real e mostra só as ferramentas que servem para ela. Ao escolher uma,
 * o arquivo vai junto, em memória, sem ser escolhido de novo.
 */
export function ImageRouter() {
  const [state, setState] = useState<RouterState>({ status: "idle" });
  const [notice, setNotice] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsHeadingRef = useRef<HTMLHeadingElement>(null);
  const runRef = useRef(0);

  async function selectFile(file: File) {
    const run = ++runRef.current;
    setState({ status: "checking" });

    const inspection = await inspectImageFile(file);
    if (run !== runRef.current) return;

    const validation = validateImage(inspection, acceptedTypes);
    if (!validation.ok) {
      setState({ status: "error", error: validation.error });
      return;
    }
    setState({
      status: "ready",
      file,
      type: validation.type,
      actions: getActionsForFileType(validation.type),
    });
  }

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

  // Leva o foco às ações, para teclado e leitor de tela.
  useEffect(() => {
    if (state.status === "ready") actionsHeadingRef.current?.focus();
  }, [state]);

  const hasAvailableAction =
    state.status === "ready" &&
    state.actions.some((tool) => tool.status === "available");

  return (
    <div
      data-dragging={isDragging || undefined}
      className={cn(
        "flex flex-col gap-4 rounded-card border-2 border-dashed border-line-strong bg-surface p-5 transition-shadow sm:p-8",
        isDragging && "ring-4 ring-ring ring-offset-4 ring-offset-background",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptAttribute(acceptedTypes)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="image-input"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length > 0) handleFiles(files);
        }}
      />

      {state.status === "ready" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="min-w-0 text-sm tabular-nums">
              <span className="font-medium break-all">{state.file.name}</span>
              <span className="text-muted">
                {" "}
                · {imageFormats[state.type].label} ·{" "}
                {formatFileSize(state.file.size)}
              </span>
            </p>
            <Button variant="ghost" onClick={openPicker}>
              Trocar imagem
            </Button>
          </div>

          <h2
            ref={actionsHeadingRef}
            tabIndex={-1}
            className="text-lg font-semibold focus:outline-none"
          >
            O que você quer fazer?
          </h2>
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {state.actions.map((tool, index) => (
              <li key={tool.slug}>
                {tool.status === "available" ? (
                  <Button
                    href={getToolHref(tool)}
                    size="lg"
                    variant={index === 0 ? "primary" : "secondary"}
                    className="w-full sm:w-auto"
                    onClick={(event: MouseEvent) => {
                      if (isPlainClick(event)) setPendingFile(state.file);
                    }}
                  >
                    {tool.actionLabel}
                  </Button>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-line px-6 text-base text-muted sm:w-auto"
                  >
                    {tool.actionLabel}
                    <Badge>Em breve</Badge>
                  </span>
                )}
              </li>
            ))}
          </ul>
          {!hasAvailableAction && (
            <Alert variant="info">
              Ainda não temos uma ferramenta pronta para imagens{" "}
              {imageFormats[state.type].label}. Ela chega em breve.
            </Alert>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <Button size="lg" className="w-full sm:w-auto" onClick={openPicker}>
            <ImageUp className="size-5" aria-hidden="true" />
            Escolher imagem
          </Button>
          <p className="hidden text-sm text-muted pointer-fine:block">
            {isDragging
              ? "Solte a imagem para abrir"
              : "ou arraste uma imagem para cá"}
          </p>
          <p className="text-sm text-muted">
            {formatTypeList(acceptedTypes)} até {formatFileSize(MAX_FILE_SIZE)}.
            A imagem não sai do seu aparelho.
          </p>
          {state.status === "checking" && (
            <p className="flex items-center gap-2 text-sm" role="status">
              <Spinner size="sm" />
              Conferindo a imagem…
            </p>
          )}
        </div>
      )}

      {notice && <Alert variant="info">{notice}</Alert>}
      {state.status === "error" && (
        <Alert variant="error" title="Não deu para usar essa imagem">
          {state.error.message}
        </Alert>
      )}
    </div>
  );
}
