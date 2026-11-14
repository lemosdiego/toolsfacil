import { describe, expect, it } from "vitest";

import {
  COMPRESSION_QUALITY,
  getCompressionOutput,
  MAX_SIZE_PRESETS,
  parseMaxSizeKb,
} from "./compression-settings";

describe("getCompressionOutput", () => {
  it("mantém o formato de entrada", () => {
    expect(getCompressionOutput("image/jpeg")?.type).toBe("image/jpeg");
    expect(getCompressionOutput("image/webp")?.type).toBe("image/webp");
    expect(getCompressionOutput("image/png")?.type).toBe("image/png");
  });

  it("JPG e WebP com perdas (qualidade); PNG sem perdas, sem controle de qualidade", () => {
    expect(getCompressionOutput("image/jpeg")?.mode).toBe("lossy");
    expect(getCompressionOutput("image/webp")?.mode).toBe("lossy");
    expect(getCompressionOutput("image/png")?.mode).toBe("lossless");
  });

  it("não compacta formatos que o canvas não gera", () => {
    expect(getCompressionOutput("image/heic")).toBeUndefined();
    expect(getCompressionOutput("image/gif")).toBeUndefined();
  });
});

describe("configurações", () => {
  it("qualidade padrão dentro dos limites", () => {
    expect(COMPRESSION_QUALITY.default).toBeGreaterThanOrEqual(
      COMPRESSION_QUALITY.min,
    );
    expect(COMPRESSION_QUALITY.default).toBeLessThanOrEqual(
      COMPRESSION_QUALITY.max,
    );
  });

  it("atalhos de tamanho em bytes", () => {
    expect(MAX_SIZE_PRESETS.map((preset) => preset.bytes)).toEqual([
      102_400, 204_800, 512_000, 1_048_576,
    ]);
  });
});

describe("parseMaxSizeKb", () => {
  it("converte KB em bytes", () => {
    expect(parseMaxSizeKb("150")).toBe(153_600);
    expect(parseMaxSizeKb(" 50 ")).toBe(51_200);
  });

  it("recusa valores inválidos ou fora dos limites", () => {
    expect(parseMaxSizeKb("")).toBeUndefined();
    expect(parseMaxSizeKb("abc")).toBeUndefined();
    expect(parseMaxSizeKb("12.5")).toBeUndefined();
    expect(parseMaxSizeKb("-100")).toBeUndefined();
    expect(parseMaxSizeKb("5")).toBeUndefined();
    expect(parseMaxSizeKb("30000")).toBeUndefined();
  });
});
