import { getToolsForFileType, type Tool } from "../tools";
import type { ImageMimeType } from "./detect-image-type";
import { formatFileSize } from "./format-file-size";
import { formatTypeList, imageFormats } from "./image-formats";
import { MAX_FILE_SIZE, MAX_PIXELS, MAX_SIDE } from "./image-limits";
import type { ImageDimensions } from "./read-image-dimensions";

export type ImageErrorCode =
  | "empty-file"
  | "file-too-large"
  | "unknown-type"
  | "wrong-type"
  | "too-many-pixels"
  | "side-too-large"
  | "decode-failed"
  | "encode-failed";

export type ImageError = {
  code: ImageErrorCode;
  /** Mensagem em português, com o que fazer. */
  message: string;
  /** Ferramenta que serve para o arquivo, quando a atual não serve. */
  suggestedTool?: Tool;
};

/** O que se sabe do arquivo antes de decodificar. */
export type ImageInspection = {
  size: number;
  type: ImageMimeType | undefined;
  dimensions: ImageDimensions | undefined;
};

export type ImageValidation =
  | {
      ok: true;
      type: ImageMimeType;
      dimensions: ImageDimensions | undefined;
    }
  | { ok: false; error: ImageError };

function formatPixels(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/** Descrição do tipo para a mensagem ("PNG", "HEIC (foto do iPhone)"). */
function describeType(type: ImageMimeType): string {
  return type === "image/heic"
    ? "uma foto HEIC (formato do iPhone)"
    : `uma imagem ${imageFormats[type].label}`;
}

/**
 * Confere tamanho, tipo real e dimensões, nessa ordem (do mais barato ao
 * mais caro). Dimensões desconhecidas (HEIC, AVIF) passam: a decodificação
 * confere depois.
 */
export function validateImage(
  inspection: ImageInspection,
  accepts: readonly ImageMimeType[],
): ImageValidation {
  const { size, type, dimensions } = inspection;
  const acceptedList = formatTypeList(accepts);

  if (size === 0) {
    return {
      ok: false,
      error: {
        code: "empty-file",
        message: "O arquivo está vazio. Escolha outra imagem.",
      },
    };
  }

  if (size > MAX_FILE_SIZE) {
    const limit = formatFileSize(MAX_FILE_SIZE);
    // Logo acima do limite, os dois arredondam igual ("20 MB").
    const actual =
      formatFileSize(size) === limit
        ? `mais de ${limit}`
        : formatFileSize(size);

    return {
      ok: false,
      error: {
        code: "file-too-large",
        message: `A imagem tem ${actual}, e o limite é ${limit}. Escolha um arquivo menor.`,
      },
    };
  }

  if (!type) {
    return {
      ok: false,
      error: {
        code: "unknown-type",
        message: `Esse arquivo não parece ser uma imagem. Escolha um arquivo ${acceptedList}.`,
      },
    };
  }

  if (!accepts.includes(type)) {
    const suggestedTool = getToolsForFileType(type)[0];
    const suggestion = suggestedTool
      ? ` Para esse formato, use a ferramenta "${suggestedTool.name}"${suggestedTool.status === "soon" ? " (em breve)" : ""}.`
      : "";

    return {
      ok: false,
      error: {
        code: "wrong-type",
        message: `Esse arquivo é ${describeType(type)}, e aqui só dá para usar ${acceptedList}.${suggestion}`,
        suggestedTool,
      },
    };
  }

  if (dimensions) {
    const { width, height } = dimensions;
    const measures = `${formatPixels(width)} × ${formatPixels(height)} pixels`;

    if (Math.max(width, height) > MAX_SIDE) {
      return {
        ok: false,
        error: {
          code: "side-too-large",
          message: `A imagem tem ${measures}, e o lado maior pode ter até ${formatPixels(MAX_SIDE)} pixels. Reduza as dimensões e tente de novo.`,
        },
      };
    }

    if (width * height > MAX_PIXELS) {
      return {
        ok: false,
        error: {
          code: "too-many-pixels",
          message: `A imagem tem ${measures}, acima do máximo de ${formatPixels(MAX_PIXELS)} pixels (4096 × 4096) que os celulares conseguem processar. Reduza as dimensões e tente de novo.`,
        },
      };
    }
  }

  return { ok: true, type, dimensions };
}

/** Mensagens dos erros que só aparecem ao processar. */
export const processingErrors = {
  "decode-failed": {
    code: "decode-failed",
    message:
      "Não foi possível abrir a imagem. O arquivo pode estar corrompido: tente outra imagem.",
  },
  "encode-failed": {
    code: "encode-failed",
    message:
      "Não foi possível gerar a imagem neste navegador. Tente de novo ou use outro navegador.",
  },
} as const satisfies Record<string, ImageError>;
