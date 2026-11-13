import type { ImageMimeType } from "./detect-image-type";

export type ImageDimensions = { width: number; height: number };

/**
 * Quantos bytes do começo do arquivo ler para achar as dimensões. No JPEG,
 * o tamanho vem depois do EXIF, que pode ter dezenas de KB (miniatura).
 */
export const DIMENSIONS_HEADER_LENGTH = 256 * 1024;

const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function readPng(bytes: Uint8Array): ImageDimensions | undefined {
  // Assinatura (8) + tamanho e tipo do chunk IHDR (8): largura e altura.
  if (bytes.length < 24) return undefined;
  const data = view(bytes);
  return { width: data.getUint32(16), height: data.getUint32(20) };
}

function readJpeg(bytes: Uint8Array): ImageDimensions | undefined {
  const data = view(bytes);
  let offset = 2; // pula o SOI (FF D8)

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const marker = bytes[offset + 1];

    // Bytes de preenchimento (FF FF ...) e marcadores sem tamanho.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2;
      continue;
    }

    const length = data.getUint16(offset + 2);
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (offset + 9 > bytes.length) return undefined;
      return {
        height: data.getUint16(offset + 5),
        width: data.getUint16(offset + 7),
      };
    }
    offset += 2 + length;
  }

  return undefined;
}

function readWebp(bytes: Uint8Array): ImageDimensions | undefined {
  if (bytes.length < 30) return undefined;
  const data = view(bytes);
  const chunk = String.fromCharCode(...bytes.subarray(12, 16));

  if (chunk === "VP8 ") {
    return {
      width: data.getUint16(26, true) & 0x3fff,
      height: data.getUint16(28, true) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const [b0, b1, b2, b3] = bytes.subarray(21, 25);
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  if (chunk === "VP8X") {
    const read24 = (offset: number) =>
      bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
    return { width: 1 + read24(24), height: 1 + read24(27) };
  }

  return undefined;
}

function readGif(bytes: Uint8Array): ImageDimensions | undefined {
  if (bytes.length < 10) return undefined;
  const data = view(bytes);
  return { width: data.getUint16(6, true), height: data.getUint16(8, true) };
}

/**
 * Largura e altura lidas do cabeçalho, sem decodificar a imagem (barato até
 * para fotos enormes). São as dimensões gravadas, antes da orientação do
 * EXIF. Devolve `undefined` para formatos sem leitura (HEIC, AVIF) ou
 * cabeçalho incompleto.
 */
export function readImageDimensions(
  bytes: Uint8Array,
  type: ImageMimeType,
): ImageDimensions | undefined {
  switch (type) {
    case "image/png":
      return readPng(bytes);
    case "image/jpeg":
      return readJpeg(bytes);
    case "image/webp":
      return readWebp(bytes);
    case "image/gif":
      return readGif(bytes);
    default:
      return undefined;
  }
}
