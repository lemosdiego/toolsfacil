import { describe, expect, it } from "vitest";

import { readImageDimensions } from "./read-image-dimensions";
import { bytesOf, ftypHeader, pngHeader, uint16, uint16le } from "./test-bytes";

/** JPEG com um segmento APP1 (EXIF) antes do SOF, como nas fotos. */
function jpegHeader(width: number, height: number, sof = 0xc0) {
  const app1Payload = new Array(300).fill(0);
  return bytesOf(
    [0xff, 0xd8],
    [0xff, 0xe1],
    uint16(app1Payload.length + 2),
    app1Payload,
    [0xff, sof],
    uint16(17),
    [8],
    uint16(height),
    uint16(width),
    [3],
  );
}

describe("readImageDimensions", () => {
  it("lê o IHDR do PNG", () => {
    expect(readImageDimensions(pngHeader(5000, 4000), "image/png")).toEqual({
      width: 5000,
      height: 4000,
    });
  });

  it("lê o SOF do JPEG depois do EXIF (baseline e progressivo)", () => {
    expect(readImageDimensions(jpegHeader(4032, 3024), "image/jpeg")).toEqual({
      width: 4032,
      height: 3024,
    });
    expect(
      readImageDimensions(jpegHeader(800, 600, 0xc2), "image/jpeg"),
    ).toEqual({ width: 800, height: 600 });
  });

  it("pula bytes de preenchimento entre segmentos do JPEG", () => {
    const bytes = bytesOf(
      [0xff, 0xd8, 0xff, 0xff],
      [0xc0],
      uint16(17),
      [8],
      uint16(10),
      uint16(20),
      [3],
    );
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 20,
      height: 10,
    });
  });

  it("lê WebP com perdas (VP8)", () => {
    const bytes = bytesOf(
      "RIFF",
      [0, 0, 0, 0],
      "WEBPVP8 ",
      [0, 0, 0, 0],
      [0, 0, 0],
      [0x9d, 0x01, 0x2a],
      uint16le(640),
      uint16le(480),
    );
    expect(readImageDimensions(bytes, "image/webp")).toEqual({
      width: 640,
      height: 480,
    });
  });

  it("lê WebP sem perdas (VP8L)", () => {
    const width = 300;
    const height = 200;
    const w = width - 1;
    const h = height - 1;
    const bytes = bytesOf(
      "RIFF",
      [0, 0, 0, 0],
      "WEBPVP8L",
      [0, 0, 0, 0],
      [0x2f],
      [
        w & 0xff,
        ((w >> 8) & 0x3f) | ((h & 0x03) << 6),
        (h >> 2) & 0xff,
        (h >> 10) & 0x0f,
      ],
      [0, 0, 0, 0, 0],
    );
    expect(readImageDimensions(bytes, "image/webp")).toEqual({ width, height });
  });

  it("lê WebP estendido (VP8X)", () => {
    const bytes = bytesOf(
      "RIFF",
      [0, 0, 0, 0],
      "WEBPVP8X",
      [10, 0, 0, 0],
      [0, 0, 0, 0],
      [0x1f, 0x03, 0x00], // 799 + 1
      [0x57, 0x02, 0x00], // 599 + 1
    );
    expect(readImageDimensions(bytes, "image/webp")).toEqual({
      width: 800,
      height: 600,
    });
  });

  it("lê o GIF", () => {
    const bytes = bytesOf("GIF89a", uint16le(120), uint16le(90));
    expect(readImageDimensions(bytes, "image/gif")).toEqual({
      width: 120,
      height: 90,
    });
  });

  it("não lê HEIC (fica para a decodificação)", () => {
    expect(readImageDimensions(ftypHeader("heic", []), "image/heic")).toBe(
      undefined,
    );
  });

  it("devolve undefined com cabeçalho cortado", () => {
    expect(
      readImageDimensions(pngHeader(10, 10).subarray(0, 20), "image/png"),
    ).toBe(undefined);
    expect(
      readImageDimensions(jpegHeader(10, 10).subarray(0, 100), "image/jpeg"),
    ).toBe(undefined);
  });
});
