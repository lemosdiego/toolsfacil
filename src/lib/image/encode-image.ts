import type { ImageMimeType } from "./detect-image-type";
import type { ImageErrorCode } from "./validate-image";

/** Formatos que o canvas consegue gerar. */
export type OutputImageType = Extract<
  ImageMimeType,
  "image/png" | "image/jpeg" | "image/webp"
>;

export type EncodeOptions = {
  type: OutputImageType;
  /** Qualidade de 0 a 1 (JPG e WebP). Sem ela, o padrão do navegador. */
  quality?: number;
  /**
   * `canvas` (padrão) ou `wasm`: codificador WebP em WASM, para o navegador
   * que não gera WebP pelo canvas (ver `canEncode`). Só vale para WebP.
   */
  encoder?: "canvas" | "wasm";
  /**
   * Otimiza o PNG sem perdas com o oxipng (WASM, carregado sob demanda).
   * Só vale para PNG.
   */
  optimizePng?: boolean;
};

export type EncodedImage = {
  blob: Blob;
  /** Dimensões já com a orientação do EXIF aplicada. */
  width: number;
  height: number;
};

/** Erro de processamento com o código da mensagem (ver validate-image.ts). */
export class ImageProcessingError extends Error {
  constructor(
    readonly code: Extract<ImageErrorCode, "decode-failed" | "encode-failed">,
  ) {
    super(code);
    this.name = "ImageProcessingError";
  }
}

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;

function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasToBlob(
  canvas: AnyCanvas,
  { type, quality }: EncodeOptions,
): Promise<Blob | null> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encodeWithWasm(
  imageData: ImageData,
  { quality }: EncodeOptions,
): Promise<Blob> {
  try {
    const { encodeWebpWithWasm } = await import("./wasm-webp-encoder");
    return await encodeWebpWithWasm(imageData, quality);
  } catch {
    throw new ImageProcessingError("encode-failed");
  }
}

async function optimizePng(imageData: ImageData): Promise<Blob> {
  try {
    const { optimizePngWithWasm } = await import("./wasm-png-optimizer");
    return await optimizePngWithWasm(imageData);
  } catch {
    throw new ImageProcessingError("encode-failed");
  }
}

/**
 * Decodifica a imagem (com a orientação do EXIF), desenha no canvas e gera o
 * formato pedido. Regravar pelo canvas remove os metadados (inclusive GPS).
 * Roda no Web Worker (OffscreenCanvas) ou, como reserva, na thread principal.
 */
export async function encodeImage(
  file: Blob,
  options: EncodeOptions,
): Promise<EncodedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageProcessingError("decode-failed");
  }

  const { width, height } = bitmap;
  const canvas = createCanvas(width, height);

  try {
    const context = canvas.getContext("2d") as
      OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
    if (!context) throw new ImageProcessingError("encode-failed");

    // JPG não tem transparência: sem fundo, as áreas transparentes ficariam pretas.
    if (options.type === "image/jpeg") {
      context.fillStyle = "white";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(bitmap, 0, 0);

    const getPixels = () => context.getImageData(0, 0, width, height);
    let blob: Blob | null;
    if (options.optimizePng && options.type === "image/png") {
      blob = await optimizePng(getPixels());
    } else if (options.encoder === "wasm" && options.type === "image/webp") {
      blob = await encodeWithWasm(getPixels(), options);
    } else {
      blob = await canvasToBlob(canvas, options);
    }
    // Sem suporte ao formato, o navegador devolve PNG em silêncio (ex.: WebP no Safari).
    if (!blob || blob.type !== options.type) {
      throw new ImageProcessingError("encode-failed");
    }

    return { blob, width, height };
  } finally {
    bitmap.close();
    // Libera a memória do canvas logo (importante no iOS).
    canvas.width = 0;
    canvas.height = 0;
  }
}
