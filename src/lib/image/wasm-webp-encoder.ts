import encode from "@jsquash/webp/encode.js";

/**
 * Codificador de WebP em WASM (libwebp), para navegadores cujo canvas não
 * gera WebP (Safari). Carregado só com `import()` dinâmico, dentro do Web
 * Worker, quando a pessoa escolhe a imagem: não pesa para os outros.
 */
export async function encodeWebpWithWasm(
  imageData: ImageData,
  quality = 0.8,
): Promise<Blob> {
  const buffer = await encode(imageData, {
    quality: Math.round(quality * 100),
  });
  return new Blob([buffer], { type: "image/webp" });
}
