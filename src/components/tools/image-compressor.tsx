"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";
import { canEncode } from "@/lib/image/can-encode";
import {
  COMPRESSION_QUALITY,
  DEFAULT_MAX_SIZE_BYTES,
  getCompressionOutput,
  MAX_SIZE_INPUT_KB,
  MAX_SIZE_PRESETS,
  parseMaxSizeKb,
} from "@/lib/image/compression-settings";
import type { ImageMimeType } from "@/lib/image/detect-image-type";
import { formatFileSize } from "@/lib/image/format-file-size";
import { imageFormats } from "@/lib/image/image-formats";
import { getOutputFileName } from "@/lib/image/output-file-name";
import { processImage } from "@/lib/image/process-image";
import { getToolBySlug, getToolHref } from "@/lib/tools";

import { ImageToolView } from "./image-tool-view";
import { useImageTool } from "./use-image-tool";

type CompressionMode = "quality" | "max-size";

type Settings = {
  mode: CompressionMode;
  quality: number;
  maxBytes: number;
};

/** Espera parar de mexer nas opções antes de compactar de novo. */
const SETTINGS_DEBOUNCE_MS = 350;

const accepts = getToolBySlug("compactar-imagem")?.accepts ?? [];
const webpTool = getToolBySlug("png-para-webp");
const resizeTool = getToolBySlug("cortador-de-imagem");

const linkClass = "font-medium underline underline-offset-4";

/**
 * Ilha da ferramenta Compactar imagem: regrava no mesmo formato. JPG e
 * WebP por qualidade ou por tamanho máximo; PNG otimizado sem perdas
 * (oxipng). Avisa quando a imagem já estava otimizada ou não coube.
 */
export function ImageCompressor() {
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [quality, setQuality] = useState<number>(COMPRESSION_QUALITY.default);
  const [maxBytes, setMaxBytes] = useState(DEFAULT_MAX_SIZE_BYTES);
  const [customSelected, setCustomSelected] = useState(false);
  const [customKb, setCustomKb] = useState("");
  // Opções do resultado na tela (as do controle podem estar mudando).
  const [applied, setApplied] = useState<Settings>({
    mode,
    quality,
    maxBytes,
  });
  const settingsRef = useRef<Settings>(applied);

  const tool = useImageTool({
    accepts,
    process: async (file, sourceType) => {
      const output = getCompressionOutput(sourceType);
      if (!output) throw new Error(`Formato sem compactação: ${sourceType}`);
      if (output.mode === "lossless") {
        return processImage(file, { type: output.type, optimizePng: true });
      }

      const settings = settingsRef.current;
      return processImage(file, {
        type: output.type,
        // Safari: o canvas não gera WebP, então entra o codificador WASM.
        encoder:
          output.type === "image/webp" && !(await canEncode("image/webp"))
            ? "wasm"
            : "canvas",
        ...(settings.mode === "max-size"
          ? { maxBytes: settings.maxBytes }
          : { quality: settings.quality / 100 }),
      });
    },
    getFileName: (file, sourceType) =>
      getOutputFileName(file.name, {
        extension: imageFormats[sourceType].extension,
        suffix: "compactada",
      }),
  });
  const { state, reprocess } = tool;

  // Compacta de novo quando a pessoa para de mexer nas opções.
  useEffect(() => {
    const current = settingsRef.current;
    if (
      current.mode === mode &&
      current.quality === quality &&
      current.maxBytes === maxBytes
    ) {
      return;
    }
    const timer = setTimeout(() => {
      settingsRef.current = { mode, quality, maxBytes };
      setApplied(settingsRef.current);
      void reprocess();
    }, SETTINGS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [mode, quality, maxBytes, reprocess]);

  const sourceType: ImageMimeType | undefined =
    state.status === "processing" || state.status === "done"
      ? state.sourceType
      : undefined;
  const isLossless =
    sourceType !== undefined &&
    getCompressionOutput(sourceType)?.mode === "lossless";

  const done = state.status === "done" ? state : undefined;
  const result = done?.result;
  const notSmaller =
    done !== undefined && done.result.blob.size >= done.file.size;
  const didNotFit = result?.fitsMaxBytes === false;
  const customInvalid =
    customSelected && customKb !== "" && parseMaxSizeKb(customKb) === undefined;

  function selectPreset(bytes: number) {
    setCustomSelected(false);
    setMaxBytes(bytes);
  }

  function changeCustomKb(value: string) {
    setCustomKb(value);
    const bytes = parseMaxSizeKb(value);
    if (bytes !== undefined) setMaxBytes(bytes);
  }

  return (
    <ImageToolView
      tool={tool}
      accepts={accepts}
      outputLabel={sourceType ? imageFormats[sourceType].label : "imagem"}
      previewAlt="Prévia da imagem compactada"
      controls={
        <>
          {isLossless ? (
            <Alert variant="info" title="PNG otimizado sem perdas">
              <p>
                Nenhum pixel muda: só a forma de guardar a imagem fica mais
                eficiente. Para reduzir bem mais, mantendo a transparência,
                converta para WebP.
              </p>
              {webpTool?.status === "available" && (
                <p className="mt-1">
                  <Link href={getToolHref(webpTool)} className={linkClass}>
                    Abrir {webpTool.name}
                  </Link>
                </p>
              )}
            </Alert>
          ) : (
            <div className="flex flex-col gap-4 sm:max-w-sm">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">
                  Como compactar
                </legend>
                <div className="grid grid-cols-2 gap-1 rounded-control border border-line-strong p-1">
                  <SegmentOption
                    name="compression-mode"
                    checked={mode === "quality"}
                    onChange={() => setMode("quality")}
                    label="Qualidade"
                  />
                  <SegmentOption
                    name="compression-mode"
                    checked={mode === "max-size"}
                    onChange={() => setMode("max-size")}
                    label="Tamanho máximo"
                  />
                </div>
              </fieldset>

              {mode === "quality" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <label
                      htmlFor="compression-quality"
                      className="font-medium"
                    >
                      Qualidade
                    </label>
                    <output
                      htmlFor="compression-quality"
                      className="text-muted tabular-nums"
                    >
                      {quality}
                    </output>
                  </div>
                  <input
                    id="compression-quality"
                    type="range"
                    min={COMPRESSION_QUALITY.min}
                    max={COMPRESSION_QUALITY.max}
                    step={1}
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    aria-describedby="compression-quality-hint"
                    className="h-11 w-full cursor-pointer accent-primary"
                  />
                  <p
                    id="compression-quality-hint"
                    className="text-sm text-muted"
                  >
                    Menor qualidade, arquivo mais leve.{" "}
                    {COMPRESSION_QUALITY.default} costuma não ter diferença
                    visível. PNG é otimizado sem perdas, sem esse ajuste.
                  </p>
                </div>
              ) : (
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-medium">
                    Tamanho máximo do arquivo
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MAX_SIZE_PRESETS.map((preset) => (
                      <ChipOption
                        key={preset.bytes}
                        name="max-size"
                        checked={!customSelected && maxBytes === preset.bytes}
                        onChange={() => selectPreset(preset.bytes)}
                        label={preset.label}
                      />
                    ))}
                    <ChipOption
                      name="max-size"
                      checked={customSelected}
                      onChange={() => {
                        setCustomSelected(true);
                        changeCustomKb(customKb);
                      }}
                      label="Outro"
                    />
                  </div>
                  {customSelected && (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="max-size-kb"
                        className="text-sm font-medium"
                      >
                        Tamanho em KB
                      </label>
                      <input
                        id="max-size-kb"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={customKb}
                        onChange={(event) => changeCustomKb(event.target.value)}
                        aria-invalid={customInvalid || undefined}
                        aria-describedby="max-size-kb-hint"
                        placeholder="Ex.: 300"
                        className="h-11 rounded-control border border-line-strong bg-surface px-3 tabular-nums"
                      />
                      <p
                        id="max-size-kb-hint"
                        className={cn(
                          "text-sm",
                          customInvalid ? "text-danger" : "text-muted",
                        )}
                      >
                        Um número inteiro de {MAX_SIZE_INPUT_KB.min} a{" "}
                        {MAX_SIZE_INPUT_KB.max} KB.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted">
                    Para JPG e WebP: a página acha a melhor qualidade que cabe
                    no limite.
                  </p>
                </fieldset>
              )}
            </div>
          )}

          {result?.quality !== undefined && result.fitsMaxBytes && (
            <p className="text-sm text-muted">
              Qualidade usada:{" "}
              <span className="tabular-nums">
                {Math.round(result.quality * 100)}
              </span>
            </p>
          )}

          {didNotFit && done && (
            <Alert
              variant="info"
              title={`Não coube em ${formatFileSize(applied.maxBytes)}`}
            >
              Mesmo com a qualidade mínima, a imagem ficou com{" "}
              {formatFileSize(done.result.blob.size)}. Você pode baixar assim ou
              diminuir as dimensões da imagem (largura e altura) e tentar de
              novo.
              {resizeTool?.status === "available" && (
                <>
                  {" "}
                  <Link href={getToolHref(resizeTool)} className={linkClass}>
                    Abrir {resizeTool.name}
                  </Link>
                </>
              )}
            </Alert>
          )}

          {notSmaller && !didNotFit && done && (
            <Alert variant="info" title="Essa imagem já está bem otimizada">
              {isLossless
                ? "Não deu para reduzir o PNG sem perdas. Para um arquivo bem menor, converta para WebP."
                : result?.fitsMaxBytes && done.file.size <= applied.maxBytes
                  ? `A imagem original já tem menos de ${formatFileSize(applied.maxBytes)}: você pode usá-la como está.`
                  : "O resultado não ficou menor que o original. Você pode usar a imagem original ou diminuir a qualidade."}
            </Alert>
          )}
        </>
      }
    />
  );
}

type OptionProps = {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
};

/** Opção de um controle segmentado (rádio nativo, com teclado e leitor de tela). */
function SegmentOption({ name, checked, onChange, label }: OptionProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-center rounded-control px-3 text-sm font-medium has-focus-visible:ring-2 has-focus-visible:ring-ring",
        checked
          ? "bg-primary text-on-primary"
          : "text-foreground hover:bg-surface-muted",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

/** Atalho de tamanho (rádio nativo com cara de botão). */
function ChipOption({ name, checked, onChange, label }: OptionProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-center rounded-control border px-3 text-sm font-medium tabular-nums has-focus-visible:ring-2 has-focus-visible:ring-ring",
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-line-strong bg-surface hover:bg-surface-muted",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}
