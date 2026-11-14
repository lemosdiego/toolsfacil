import { MAX_SIZE_SEARCH } from "./compression-settings";
import type { ImageMimeType } from "./detect-image-type";
import { findQualityForSize } from "./find-quality-for-size";
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
  /**
   * Tamanho máximo em bytes (JPG e WebP): busca a maior qualidade que cabe
   * e ignora `quality`. Se nem a mínima couber, devolve o menor resultado.
   */
  maxBytes?: number;
};

export type EncodedImage = {
  blob: Blob;
  /** Dimensões já com a orientação do EXIF aplicada. */
  width: number;
  height: number;
  /** Qualidade usada (0 a 1), no modo de tamanho máximo. */
  quality?: number;
  /** No modo de tamanho máximo: o resultado coube no limite? */
  fitsMaxBytes?: boolean;
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

/** Sem suporte ao formato, o navegador devolve PNG em silêncio (ex.: WebP no Safari). */
function checkType(blob: Blob | null, type: OutputImageType): Blob {
  if (!blob || blob.type !== type) {
    throw new ImageProcessingError("encode-failed");
  }
  return blob;
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

    if (options.optimizePng && options.type === "image/png") {
      const blob = checkType(await optimizePng(getPixels()), options.type);
      return { blob, width, height };
    }

    const encodeAt = async (quality?: number) => {
      const withQuality = { ...options, quality };
      const blob =
        options.encoder === "wasm" && options.type === "image/webp"
          ? await encodeWithWasm(getPixels(), withQuality)
          : await canvasToBlob(canvas, withQuality);
      return checkType(blob, options.type);
    };

    if (options.maxBytes !== undefined && options.type !== "image/png") {
      const { blob, quality, fits } = await findQualityForSize(
        encodeAt,
        options.maxBytes,
        MAX_SIZE_SEARCH,
      );
      return { blob, width, height, quality, fitsMaxBytes: fits };
    }

    return { blob: await encodeAt(options.quality), width, height };
  } finally {
    bitmap.close();
    // Libera a memória do canvas logo (importante no iOS).
    canvas.width = 0;
    canvas.height = 0;
  }
}
