import type { OutputImageType } from "./encode-image";

const cache = new Map<OutputImageType, Promise<boolean>>();

/**
 * O navegador gera esse formato pelo canvas? Codifica uma imagem de 1 pixel
 * e confere o tipo do resultado: sem suporte, o navegador devolve PNG em
 * silêncio (ex.: WebP no Safari). A resposta fica guardada.
 */
export function canEncode(type: OutputImageType): Promise<boolean> {
  const cached = cache.get(type);
  if (cached) return cached;

  const check = new Promise<boolean>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === type), type);
  });
  cache.set(type, check);
  return check;
}
