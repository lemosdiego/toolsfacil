import { describe, expect, it, vi } from "vitest";

import { findQualityForSize } from "./find-quality-for-size";

const options = { minQuality: 0.3, maxQuality: 0.95, maxAttempts: 7 };

/** Codificador simulado: o tamanho cresce com a qualidade (1000 B por ponto). */
function fakeEncoder() {
  return vi.fn(
    async (quality: number) =>
      new Blob([new Uint8Array(Math.round(quality * 100) * 1000)]),
  );
}

describe("findQualityForSize", () => {
  it("devolve a qualidade máxima quando ela já cabe", async () => {
    const encode = fakeEncoder();

    const result = await findQualityForSize(encode, 1_000_000, options);

    expect(result).toMatchObject({ quality: 0.95, fits: true });
    expect(encode).toHaveBeenCalledTimes(1);
  });

  it("acha a maior qualidade que cabe no limite", async () => {
    const encode = fakeEncoder();

    // Cabe até 60 pontos (60.000 B).
    const result = await findQualityForSize(encode, 60_500, options);

    expect(result.fits).toBe(true);
    expect(result.blob.size).toBeLessThanOrEqual(60_500);
    // Com 7 tentativas, chega a até 2 pontos da resposta exata.
    expect(result.quality).toBeGreaterThanOrEqual(0.58);
    expect(result.quality).toBeLessThanOrEqual(0.6);
  });

  it("não passa do número máximo de tentativas", async () => {
    const encode = fakeEncoder();

    await findQualityForSize(encode, 61_234, options);

    expect(encode.mock.calls.length).toBeLessThanOrEqual(7);
  });

  it("sem solução, devolve o resultado da qualidade mínima marcado como 'não coube'", async () => {
    const encode = fakeEncoder();

    const result = await findQualityForSize(encode, 10_000, options);

    expect(result).toMatchObject({ quality: 0.3, fits: false });
    expect(result.blob.size).toBe(30_000);
    expect(encode).toHaveBeenCalledTimes(2);
  });

  it("usa qualidades com duas casas", async () => {
    const encode = fakeEncoder();

    await findQualityForSize(encode, 47_000, options);

    for (const [quality] of encode.mock.calls) {
      expect(Math.round(quality * 100) / 100).toBe(quality);
    }
  });
});
