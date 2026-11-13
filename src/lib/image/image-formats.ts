import type { ImageMimeType } from "./detect-image-type";

type ImageFormat = {
  /** Nome curto mostrado ao usuário (ex.: "PNG"). */
  label: string;
  /** Extensão do arquivo de saída, sem ponto. */
  extension: string;
  /** Extensões aceitas no seletor de arquivo. */
  inputExtensions: readonly string[];
};

export const imageFormats: Record<ImageMimeType, ImageFormat> = {
  "image/png": { label: "PNG", extension: "png", inputExtensions: [".png"] },
  "image/jpeg": {
    label: "JPG",
    extension: "jpg",
    inputExtensions: [".jpg", ".jpeg"],
  },
  "image/webp": {
    label: "WebP",
    extension: "webp",
    inputExtensions: [".webp"],
  },
  "image/gif": { label: "GIF", extension: "gif", inputExtensions: [".gif"] },
  "image/heic": {
    label: "HEIC",
    extension: "heic",
    inputExtensions: [".heic", ".heif"],
  },
  "image/avif": {
    label: "AVIF",
    extension: "avif",
    inputExtensions: [".avif"],
  },
};

/** Valor do atributo `accept` do seletor (tipos MIME e extensões). */
export function getAcceptAttribute(types: readonly ImageMimeType[]): string {
  return types
    .flatMap((type) => [type, ...imageFormats[type].inputExtensions])
    .join(",");
}

/** Lista legível dos formatos: "PNG", "PNG ou JPG", "JPG, PNG ou WebP". */
export function formatTypeList(types: readonly ImageMimeType[]): string {
  return new Intl.ListFormat("pt-BR", { type: "disjunction" }).format(
    types.map((type) => imageFormats[type].label),
  );
}
