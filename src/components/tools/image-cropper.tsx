"use client";

import { Crop, Link2, Link2Off, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { canEncode } from "@/lib/image/can-encode";
import {
  checkOutputSize,
  nextRotation,
  resizeWithLock,
  type Rect,
  type Rotation,
  type Size,
} from "@/lib/image/crop-geometry";
import {
  cropPresets,
  DEFAULT_CROP_PRESET,
  getCropPreset,
} from "@/lib/image/crop-presets";
import type { ImageMimeType } from "@/lib/image/detect-image-type";
import type { OutputImageType } from "@/lib/image/encode-image";
import { imageFormats } from "@/lib/image/image-formats";
import { MAX_PIXELS, MAX_SIDE } from "@/lib/image/image-limits";
import { getOutputFileName } from "@/lib/image/output-file-name";
import { processImage } from "@/lib/image/process-image";
import { getToolBySlug } from "@/lib/tools";

import { CropEditor } from "./crop-editor";
import { ImageToolView } from "./image-tool-view";
import { useImageTool } from "./use-image-tool";

/** Qualidade do JPG e do WebP cortados: quem corta não quer perder detalhe. */
export const CROP_OUTPUT_QUALITY = 0.92;

/** Maior lado da prévia do editor (leve até em fotos de 20 MB). */
const EDITOR_PREVIEW_SIDE = 1600;

const accepts = getToolBySlug("cortador-de-imagem")?.accepts ?? [];
const compressTool = getToolBySlug("compactar-imagem");

type Preview = {
  file: File;
  rotation: Rotation;
  url: string;
  /** Dimensões reais da imagem girada (a prévia pode ser menor). */
  imageSize: Size;
};

type CropSettings = { rotation: Rotation; crop?: Rect; output?: Size };

/** Formato de saída: o mesmo da original (o cortador aceita só estes). */
function outputTypeOf(type: ImageMimeType): OutputImageType {
  return type === "image/png" || type === "image/webp" ? type : "image/jpeg";
}

function parseSide(value: string): number {
  return /^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN;
}

/**
 * Ilha da ferramenta Cortar e redimensionar: a pessoa ajusta o corte no
 * editor (proporções, girar e tamanho final) e só então gera o arquivo, no
 * mesmo formato da original, pelo Web Worker.
 */
export function ImageCropper() {
  const [presetId, setPresetId] = useState(DEFAULT_CROP_PRESET.id);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [crop, setCrop] = useState<Rect>();
  const [sizeText, setSizeText] = useState<{
    width: string;
    height: string;
  } | null>(null);
  const [locked, setLocked] = useState(true);
  const [preview, setPreview] = useState<Preview>();
  const [previewError, setPreviewError] = useState<{
    file: File;
    rotation: Rotation;
  }>();
  const settingsRef = useRef<CropSettings>({ rotation: 0 });

  const tool = useImageTool({
    accepts,
    processOnSelect: false,
    process: async (file, sourceType) => {
      const type = outputTypeOf(sourceType);
      const { rotation, crop, output } = settingsRef.current;
      return processImage(file, {
        type,
        quality: type === "image/png" ? undefined : CROP_OUTPUT_QUALITY,
        // Safari: o canvas não gera WebP, então entra o codificador WASM.
        encoder:
          type === "image/webp" && !(await canEncode("image/webp"))
            ? "wasm"
            : "canvas",
        rotate: rotation,
        crop,
        resize: output,
      });
    },
    getFileName: (file, sourceType) =>
      getOutputFileName(file.name, {
        extension: imageFormats[outputTypeOf(sourceType)].extension,
        suffix: "cortada",
      }),
  });
  const { state, apply, backToEditing } = tool;

  const editingFile = state.status === "editing" ? state.file : undefined;
  const sourceType: ImageMimeType | undefined =
    "sourceType" in state ? state.sourceType : undefined;

  // Imagem nova: volta às opções iniciais (ajuste durante o render, sem efeito).
  const fileOfState = "file" in state ? state.file : undefined;
  const [optionsFile, setOptionsFile] = useState<File>();
  if (fileOfState && fileOfState !== optionsFile) {
    setOptionsFile(fileOfState);
    setRotation(0);
    setPresetId(DEFAULT_CROP_PRESET.id);
    setCrop(undefined);
    setSizeText(null);
  }

  // Prévia do editor (de pé, girada e reduzida), gerada no worker.
  useEffect(() => {
    if (!editingFile) return;
    if (preview?.file === editingFile && preview.rotation === rotation) return;
    let cancelled = false;
    const type = outputTypeOf(sourceType ?? "image/jpeg");
    processImage(editingFile, {
      type: type === "image/jpeg" ? "image/jpeg" : "image/png",
      quality: 0.85,
      rotate: rotation,
      fit: EDITOR_PREVIEW_SIDE,
    })
      .then((result) => {
        if (cancelled) return;
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old.url);
          return {
            file: editingFile,
            rotation,
            url: URL.createObjectURL(result.blob),
            imageSize: {
              width: result.sourceWidth,
              height: result.sourceHeight,
            },
          };
        });
      })
      .catch(() => {
        if (!cancelled) setPreviewError({ file: editingFile, rotation });
      });
    return () => {
      cancelled = true;
    };
  }, [editingFile, rotation, sourceType, preview]);

  // Ao sair da página: libera a URL da prévia.
  const previewUrlRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    previewUrlRef.current = preview?.url;
  }, [preview]);
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const previewFailed =
    previewError?.file === editingFile && previewError?.rotation === rotation;
  const preset = getCropPreset(presetId);
  const cropSize: Size | undefined = crop && {
    width: crop.width,
    height: crop.height,
  };
  const output: Size | undefined = sizeText
    ? { width: parseSide(sizeText.width), height: parseSide(sizeText.height) }
    : cropSize;
  const outputCheck = output ? checkOutputSize(output) : undefined;
  const isUpscale =
    output !== undefined &&
    cropSize !== undefined &&
    outputCheck?.ok === true &&
    (output.width > cropSize.width || output.height > cropSize.height);

  function handleCropChange(next: Rect) {
    setCrop(next);
    // Tamanho escolhido com a proporção travada: a largura fica, a altura acompanha.
    setSizeText((current) => {
      if (!current || !locked) return current;
      const width = parseSide(current.width);
      if (!Number.isFinite(width)) return current;
      return {
        width: current.width,
        height: String(
          Math.max(1, Math.round((width * next.height) / next.width)),
        ),
      };
    });
  }

  function changeSide(side: "width" | "height", value: string) {
    const base = sizeText ?? {
      width: String(cropSize?.width ?? ""),
      height: String(cropSize?.height ?? ""),
    };
    const number = parseSide(value);
    if (!locked || !cropSize || !Number.isFinite(number) || number < 1) {
      setSizeText({ ...base, [side]: value });
      return;
    }
    const resized = resizeWithLock(
      { width: parseSide(base.width), height: parseSide(base.height) },
      { [side]: number },
      cropSize.width / cropSize.height,
    );
    setSizeText({
      width: side === "width" ? value : String(resized.width),
      height: side === "height" ? value : String(resized.height),
    });
  }

  function handleApply() {
    if (!crop || !output || !outputCheck?.ok) return;
    const sameSize =
      output.width === crop.width && output.height === crop.height;
    settingsRef.current = {
      rotation,
      crop,
      output: sameSize ? undefined : output,
    };
    void apply();
  }

  const isEditing = state.status === "editing";
  const showControls =
    isEditing || state.status === "processing" || state.status === "done";
  const done = state.status === "done" ? state : undefined;

  const editor = isEditing ? (
    preview && preview.file === editingFile && preview.rotation === rotation ? (
      <div className="flex flex-col gap-4">
        <CropEditor
          src={preview.url}
          imageSize={preview.imageSize}
          ratio={preset.ratio}
          onCropChange={handleCropChange}
        />
        {/* Abaixo do editor: no celular, fica logo depois de ajustar o corte. */}
        <Button
          size="lg"
          className="w-full sm:w-auto sm:self-start"
          disabled={!crop || outputCheck?.ok !== true}
          onClick={handleApply}
        >
          <Crop className="size-5" aria-hidden="true" />
          Cortar imagem
        </Button>
      </div>
    ) : previewFailed ? (
      <Alert variant="error" title="Não deu para abrir essa imagem">
        O arquivo pode estar corrompido. Escolha outra imagem.
      </Alert>
    ) : (
      <div className="grid h-[min(60vh,28rem)] place-items-center rounded-card bg-surface-muted shadow-card">
        <Spinner label="Preparando a imagem…" />
      </div>
    )
  ) : null;

  return (
    <ImageToolView
      tool={tool}
      accepts={accepts}
      outputLabel={
        sourceType ? imageFormats[outputTypeOf(sourceType)].label : "imagem"
      }
      previewAlt="Prévia da imagem cortada"
      editor={editor}
      controls={
        showControls && (
          <div className="flex flex-col gap-5">
            {isEditing && (
              <>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-medium">
                    Proporção
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {cropPresets.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex min-h-11 cursor-pointer flex-col justify-center rounded-control border px-3 py-1.5 text-sm has-focus-visible:ring-2 has-focus-visible:ring-ring",
                          option.id === presetId
                            ? "border-primary bg-primary text-on-primary"
                            : "border-line-strong bg-surface hover:bg-surface-muted",
                        )}
                      >
                        <input
                          type="radio"
                          name="crop-preset"
                          value={option.id}
                          checked={option.id === presetId}
                          onChange={() => {
                            setPresetId(option.id);
                            setSizeText(null);
                          }}
                          className="sr-only"
                        />
                        <span className="font-medium tabular-nums">
                          {option.label}
                        </span>
                        <span className="text-xs">{option.usage}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Button
                  variant="secondary"
                  className="self-start"
                  onClick={() => {
                    setRotation((current) => nextRotation(current));
                    setCrop(undefined);
                    setSizeText(null);
                  }}
                >
                  <RotateCw className="size-5" aria-hidden="true" />
                  Girar 90°
                </Button>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-medium">
                    Tamanho final (px)
                  </legend>
                  <div className="flex items-end gap-2">
                    <SideInput
                      id="crop-output-width"
                      label="Largura"
                      value={sizeText?.width ?? String(cropSize?.width ?? "")}
                      invalid={outputCheck?.ok === false}
                      onChange={(value) => changeSide("width", value)}
                    />
                    <IconButton
                      aria-label="Manter a proporção"
                      aria-pressed={locked}
                      variant="secondary"
                      onClick={() => setLocked((current) => !current)}
                    >
                      {locked ? (
                        <Link2 className="size-5" />
                      ) : (
                        <Link2Off className="size-5" />
                      )}
                    </IconButton>
                    <SideInput
                      id="crop-output-height"
                      label="Altura"
                      value={sizeText?.height ?? String(cropSize?.height ?? "")}
                      invalid={outputCheck?.ok === false}
                      onChange={(value) => changeSide("height", value)}
                    />
                  </div>
                  <p
                    id="crop-output-hint"
                    className={cn(
                      "text-sm",
                      outputCheck?.ok === false ? "text-danger" : "text-muted",
                    )}
                  >
                    {outputCheck?.ok === false
                      ? outputCheck.reason === "too-large"
                        ? `Grande demais: até ${MAX_SIDE.toLocaleString("pt-BR")} px de lado e ${(MAX_PIXELS / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} milhões de pixels.`
                        : "Use números inteiros maiores que zero."
                      : cropSize
                        ? `Corte: ${cropSize.width} × ${cropSize.height} px.`
                        : "Ajuste o corte na imagem."}
                  </p>
                  {sizeText && (
                    <button
                      type="button"
                      onClick={() => setSizeText(null)}
                      className="min-h-11 self-start text-sm font-medium underline underline-offset-4"
                    >
                      Usar o tamanho do corte
                    </button>
                  )}
                </fieldset>

                {isUpscale && (
                  <Alert
                    variant="info"
                    title="A imagem vai ficar maior que o corte"
                  >
                    Aumentar não cria detalhes: a imagem pode ficar menos
                    nítida.
                  </Alert>
                )}
              </>
            )}

            {done && (
              <>
                <p className="text-sm text-muted">
                  Resultado:{" "}
                  <span className="tabular-nums">
                    {done.result.width} × {done.result.height} px
                  </span>
                  .{" "}
                  {compressTool?.status === "available" && (
                    <>
                      Para reduzir os KB, use o{" "}
                      <Link
                        href="/compactar-imagem"
                        className="font-medium underline underline-offset-4"
                      >
                        compactador
                      </Link>
                      .
                    </>
                  )}
                </p>
                <Button
                  variant="secondary"
                  className="self-start"
                  onClick={backToEditing}
                >
                  Voltar a editar
                </Button>
              </>
            )}
          </div>
        )
      }
    />
  );
}

function SideInput({
  id,
  label,
  value,
  invalid,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby="crop-output-hint"
        className="h-11 w-full rounded-control border border-line-strong bg-surface px-3 tabular-nums"
      />
    </div>
  );
}
