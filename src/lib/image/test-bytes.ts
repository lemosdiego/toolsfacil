/*
 * Montadores de bytes de cabeçalho para os testes de unidade
 * (assinaturas reais, sem precisar de arquivos de imagem).
 */

export function bytesOf(...parts: (number[] | string)[]): Uint8Array {
  const values = parts.flatMap((part) =>
    typeof part === "string"
      ? Array.from(part, (char) => char.charCodeAt(0))
      : part,
  );
  return new Uint8Array(values);
}

export function uint32(value: number): number[] {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

export function uint16(value: number): number[] {
  return [(value >>> 8) & 0xff, value & 0xff];
}

export function uint16le(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

/** Cabeçalho de PNG com o chunk IHDR. */
export function pngHeader(width: number, height: number): Uint8Array {
  return bytesOf(
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    uint32(13),
    "IHDR",
    uint32(width),
    uint32(height),
    [8, 6, 0, 0, 0],
  );
}

/** Box ftyp com a marca principal e as compatíveis (HEIC, AVIF). */
export function ftypHeader(major: string, compatible: string[]): Uint8Array {
  const size = 16 + compatible.length * 4;
  return bytesOf(uint32(size), "ftyp", major, uint32(0), ...compatible);
}
