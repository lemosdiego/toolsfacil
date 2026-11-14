import { MAX_SIZE_SEARCH } from "./compression-settings";
import {
  checkOutputSize,
  fitWithin,
  rotatedSize,
  stepDownSizes,
  type Rect,
  type Rotation,
  type Size,
} from "./crop-geometry";
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
  /** Gira no sentido horário (antes do corte). */
  rotate?: Rotation;
  /** Recorte em pixels da imagem já girada. Sem ele, a imagem inteira. */
  crop?: Rect;
  /** Tamanho final exato (pode aumentar). Tem prioridade sobre `fit`. */
  resize?: Size;
  /** Reduz até o maior lado caber neste valor (nunca aumenta). Ex.: prévias. */
  fit?: number;
};

export type EncodedImage = {
  blob: Blob;
  /** Dimensões do resultado, já com a orientação do EXIF aplicada. */
  width: number;
  height: number;
  /** Dimensões da imagem de origem já girada, antes do corte. */
  sourceWidth: number;
  sourceHeight: number;
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

type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function getContext(canvas: AnyCanvas): AnyContext {
  const context = canvas.getContext("2d") as AnyContext | null;
  if (!context) throw new ImageProcessingError("encode-failed");
  return context;
}

/** Libera a memória do canvas logo (importante no iOS). */
function releaseCanvas(canvas: AnyCanvas) {
  canvas.width = 0;
  canvas.height = 0;
}

/** Posiciona o contexto para desenhar a imagem girada no sentido horário. */
function applyRotation(context: AnyContext, rotation: Rotation, size: Size) {
  if (rotation === 0) return;
  if (rotation === 90) context.translate(size.width, 0);
  if (rotation === 180) context.translate(size.width, size.height);
  if (rotation === 270) context.translate(0, size.height);
  context.rotate((rotation * Math.PI) / 180);
}

/**
 * Gira, recorta e redimensiona. Reduções grandes acontecem em etapas (metade
 * por vez), para a imagem não serrilhar.
 */
function renderGeometry(
  bitmap: ImageBitmap,
  {
    rotation,
    crop,
    target,
    opaque,
  }: {
    rotation: Rotation;
    crop: Rect;
    target: Size;
    opaque: boolean;
  },
): AnyCanvas {
  let current = createCanvas(crop.width, crop.height);
  const context = getContext(current);
  // JPG não tem transparência: sem fundo, as áreas transparentes ficariam pretas.
  if (opaque) {
    context.fillStyle = "white";
    context.fillRect(0, 0, crop.width, crop.height);
  }
  context.translate(-crop.x, -crop.y);
  applyRotation(context, rotation, rotatedSize(bitmap, rotation));
  context.drawImage(bitmap, 0, 0);

  const isSameSize =
    target.width === crop.width && target.height === crop.height;
  if (isSameSize) return current;

  for (const step of stepDownSizes(crop, target)) {
    const next = createCanvas(step.width, step.height);
    const nextContext = getContext(next);
    nextContext.imageSmoothingEnabled = true;
    nextContext.imageSmoothingQuality = "high";
    nextContext.drawImage(current, 0, 0, step.width, step.height);
    releaseCanvas(current);
    current = next;
  }
  return current;
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

  const rotation = options.rotate ?? 0;
  const source = rotatedSize(bitmap, rotation);
  const crop = options.crop ?? { x: 0, y: 0, ...source };
  const target =
    options.resize ?? (options.fit ? fitWithin(crop, options.fit) : crop);
  const { width, height } = target;
  const dimensions = {
    width,
    height,
    sourceWidth: source.width,
    sourceHeight: source.height,
  };

  let canvas: AnyCanvas | undefined;
  try {
    const cropFits =
      crop.x >= 0 &&
      crop.y >= 0 &&
      crop.x + crop.width <= source.width &&
      crop.y + crop.height <= source.height;
    if (!cropFits || !checkOutputSize(crop).ok || !checkOutputSize(target).ok) {
      throw new ImageProcessingError("encode-failed");
    }

    canvas = renderGeometry(bitmap, {
      rotation,
      crop,
      target,
      opaque: options.type === "image/jpeg",
    });
    const context = getContext(canvas);
    const finalCanvas = canvas;

    const getPixels = () => context.getImageData(0, 0, width, height);

    if (options.optimizePng && options.type === "image/png") {
      const blob = checkType(await optimizePng(getPixels()), options.type);
      return { blob, ...dimensions };
    }

    const encodeAt = async (quality?: number) => {
      const withQuality = { ...options, quality };
      const blob =
        options.encoder === "wasm" && options.type === "image/webp"
          ? await encodeWithWasm(getPixels(), withQuality)
          : await canvasToBlob(finalCanvas, withQuality);
      return checkType(blob, options.type);
    };

    if (options.maxBytes !== undefined && options.type !== "image/png") {
      const { blob, quality, fits } = await findQualityForSize(
        encodeAt,
        options.maxBytes,
        MAX_SIZE_SEARCH,
      );
      return { blob, ...dimensions, quality, fitsMaxBytes: fits };
    }

    return { blob: await encodeAt(options.quality), ...dimensions };
  } finally {
    bitmap.close();
    if (canvas) releaseCanvas(canvas);
  }
}
