import type { ImageMimeType } from "./detect-image-type";
import type { OutputImageType } from "./encode-image";
import { MAX_FILE_SIZE } from "./image-limits";

/** Controle de qualidade da compactação (escala de 0 a 100). */
export const COMPRESSION_QUALITY = {
  min: 40,
  max: 95,
  /** Ponto de partida: perda invisível na maioria das fotos. */
  default: 75,
} as const;

/** Busca do modo "Tamanho máximo" (ver `findQualityForSize`). */
export const MAX_SIZE_SEARCH = {
  minQuality: 0.3,
  maxQuality: 0.95,
  maxAttempts: 7,
} as const;

const KB = 1024;

/** Atalhos do modo "Tamanho máximo": os limites mais comuns em formulários. */
export const MAX_SIZE_PRESETS: readonly { label: string; bytes: number }[] = [
  { label: "100 KB", bytes: 100 * KB },
  { label: "200 KB", bytes: 200 * KB },
  { label: "500 KB", bytes: 500 * KB },
  { label: "1 MB", bytes: 1024 * KB },
];

export const DEFAULT_MAX_SIZE_BYTES = MAX_SIZE_PRESETS[0].bytes;

/** Limites do campo livre, em KB. */
export const MAX_SIZE_INPUT_KB = {
  min: 10,
  max: MAX_FILE_SIZE / KB,
} as const;

export type CompressionOutput = {
  /** O formato de saída é sempre o de entrada. */
  type: OutputImageType;
  /** `lossy`: qualidade e tamanho máximo; `lossless`: só otimização (PNG). */
  mode: "lossy" | "lossless";
};

/** Como compactar cada formato aceito (o mesmo formato na saída). */
export function getCompressionOutput(
  type: ImageMimeType,
): CompressionOutput | undefined {
  switch (type) {
    case "image/jpeg":
    case "image/webp":
      return { type, mode: "lossy" };
    case "image/png":
      return { type, mode: "lossless" };
    default:
      return undefined;
  }
}

/**
 * Tamanho máximo digitado no campo (em KB) convertido para bytes, ou
 * `undefined` se não for um número inteiro dentro dos limites.
 */
export function parseMaxSizeKb(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const kb = Number(trimmed);
  if (kb < MAX_SIZE_INPUT_KB.min || kb > MAX_SIZE_INPUT_KB.max) {
    return undefined;
  }
  return kb * KB;
}
