import { describe, expect, it } from "vitest";

import { detectImageType } from "./detect-image-type";
import { bytesOf, ftypHeader, pngHeader } from "./test-bytes";

describe("detectImageType", () => {
  it("reconhece PNG", () => {
    expect(detectImageType(pngHeader(10, 10))).toBe("image/png");
  });

  it("reconhece JPEG", () => {
    expect(detectImageType(bytesOf([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg",
    );
  });

  it("reconhece GIF 87a e 89a", () => {
    expect(detectImageType(bytesOf("GIF87a"))).toBe("image/gif");
    expect(detectImageType(bytesOf("GIF89a"))).toBe("image/gif");
  });

  it("reconhece WebP", () => {
    expect(detectImageType(bytesOf("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe(
      "image/webp",
    );
  });

  it("não confunde outro arquivo RIFF (WAV) com WebP", () => {
    expect(detectImageType(bytesOf("RIFF", [0, 0, 0, 0], "WAVEfmt "))).toBe(
      undefined,
    );
  });

  it.each(["heic", "heix", "mif1"])("reconhece HEIC pela marca %s", (brand) => {
    expect(detectImageType(ftypHeader(brand, ["mif1", "heic"]))).toBe(
      "image/heic",
    );
  });

  it("reconhece AVIF, mesmo com mif1 nas marcas compatíveis", () => {
    expect(detectImageType(ftypHeader("avif", ["mif1", "miaf"]))).toBe(
      "image/avif",
    );
    expect(detectImageType(ftypHeader("mif1", ["avif"]))).toBe("image/avif");
  });

  it("não reconhece vídeo MP4 (outro ftyp)", () => {
    expect(detectImageType(ftypHeader("isom", ["mp41"]))).toBe(undefined);
  });

  it("não reconhece texto nem arquivo vazio", () => {
    expect(detectImageType(bytesOf("isto é um texto"))).toBe(undefined);
    expect(detectImageType(new Uint8Array())).toBe(undefined);
  });
});
