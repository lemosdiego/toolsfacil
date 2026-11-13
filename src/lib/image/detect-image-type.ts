/** Tipos de imagem que o site reconhece pelo conteúdo do arquivo. */
export type ImageMimeType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif"
  | "image/heic"
  | "image/avif";

/** Quantos bytes do começo do arquivo bastam para reconhecer o tipo. */
export const SIGNATURE_LENGTH = 64;

const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "mif1",
  "msf1",
]);
const AVIF_BRANDS = new Set(["avif", "avis"]);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

/** Marcas do box `ftyp` (HEIC e AVIF): a principal e as compatíveis. */
function ftypBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== "ftyp") return [];

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const boxSize = Math.min(view.getUint32(0), bytes.length);
  const brands = [ascii(bytes, 8, 4)];
  for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
    brands.push(ascii(bytes, offset, 4));
  }
  return brands;
}

/**
 * Tipo real da imagem pelos primeiros bytes (a "assinatura"), sem confiar na
 * extensão. Devolve `undefined` quando não é uma imagem conhecida.
 */
export function detectImageType(bytes: Uint8Array): ImageMimeType | undefined {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (bytes.length >= 6 && /^GIF8[79]a$/.test(ascii(bytes, 0, 6))) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WEBP"
  ) {
    return "image/webp";
  }

  // AVIF também traz "mif1": confere AVIF antes de HEIC.
  const brands = ftypBrands(bytes);
  if (brands.some((brand) => AVIF_BRANDS.has(brand))) return "image/avif";
  if (brands.some((brand) => HEIC_BRANDS.has(brand))) return "image/heic";

  return undefined;
}
