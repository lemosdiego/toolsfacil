import { detectImageType } from "./detect-image-type";
import {
  DIMENSIONS_HEADER_LENGTH,
  readImageDimensions,
} from "./read-image-dimensions";
import type { ImageInspection } from "./validate-image";

/**
 * Lê só o começo do arquivo (até 256 KB) para descobrir o tipo real e as
 * dimensões, sem carregar nem decodificar a imagem inteira.
 */
export async function inspectImageFile(file: Blob): Promise<ImageInspection> {
  const header = new Uint8Array(
    await file.slice(0, DIMENSIONS_HEADER_LENGTH).arrayBuffer(),
  );
  const type = detectImageType(header);

  return {
    size: file.size,
    type,
    dimensions: type ? readImageDimensions(header, type) : undefined,
  };
}
