import { describe, expect, it } from "vitest";

import {
  checkOutputSize,
  fitWithin,
  initialCropRect,
  isRectWithin,
  nextRotation,
  resizeWithLock,
  rotatedSize,
  stepDownSizes,
  toImagePixels,
} from "./crop-geometry";
import { cropPresets, getCropPreset } from "./crop-presets";

describe("rotação", () => {
  it("gira de 90 em 90 graus e volta ao início", () => {
    expect(nextRotation(0)).toBe(90);
    expect(nextRotation(90)).toBe(180);
    expect(nextRotation(180)).toBe(270);
    expect(nextRotation(270)).toBe(0);
  });

  it("troca largura e altura em 90° e 270°", () => {
    const size = { width: 400, height: 300 };
    expect(rotatedSize(size, 0)).toEqual(size);
    expect(rotatedSize(size, 90)).toEqual({ width: 300, height: 400 });
    expect(rotatedSize(size, 180)).toEqual(size);
    expect(rotatedSize(size, 270)).toEqual({ width: 300, height: 400 });
  });
});

describe("initialCropRect", () => {
  const landscape = { x: 10, y: 20, width: 480, height: 320 };
  const portrait = { x: 0, y: 0, width: 300, height: 400 };

  it("sem proporção, usa a área inteira", () => {
    expect(initialCropRect(landscape)).toEqual(landscape);
  });

  it("1:1 numa paisagem: quadrado da altura, centralizado", () => {
    expect(initialCropRect(landscape, 1)).toEqual({
      x: 90,
      y: 20,
      width: 320,
      height: 320,
    });
  });

  it("16:9 num retrato: largura inteira, centralizado na vertical", () => {
    const rect = initialCropRect(portrait, 16 / 9);
    expect(rect.width).toBe(300);
    expect(rect.height).toBeCloseTo(168.75);
    expect(rect.y).toBeCloseTo((400 - 168.75) / 2);
  });

  it("toda proporção cabe na área", () => {
    for (const preset of cropPresets) {
      for (const area of [landscape, portrait]) {
        expect(isRectWithin(initialCropRect(area, preset.ratio), area)).toBe(
          true,
        );
      }
    }
  });
});

describe("isRectWithin", () => {
  const area = { x: 0, y: 0, width: 100, height: 100 };

  it("aceita dentro e na borda (com folga de arredondamento)", () => {
    expect(isRectWithin({ x: 0, y: 0, width: 100, height: 100 }, area)).toBe(
      true,
    );
    expect(
      isRectWithin({ x: -0.3, y: 10, width: 100.2, height: 50 }, area),
    ).toBe(true);
  });

  it("recusa fora da área ou vazio", () => {
    expect(isRectWithin({ x: -5, y: 0, width: 50, height: 50 }, area)).toBe(
      false,
    );
    expect(isRectWithin({ x: 60, y: 0, width: 50, height: 50 }, area)).toBe(
      false,
    );
    expect(isRectWithin({ x: 0, y: 0, width: 0, height: 50 }, area)).toBe(
      false,
    );
  });
});

describe("toImagePixels", () => {
  // Imagem de 480 × 320 mostrada em 240 × 160, a partir de (30, 40).
  const display = { x: 30, y: 40, width: 240, height: 160 };
  const image = { width: 480, height: 320 };

  it("converte a seleção para pixels da imagem", () => {
    expect(
      toImagePixels({ x: 80, y: 60, width: 100, height: 50 }, display, image),
    ).toEqual({ x: 100, y: 40, width: 200, height: 100 });
  });

  it("gruda nas bordas a menos de 1,5 pixel da tela", () => {
    expect(
      toImagePixels(
        { x: 30.6, y: 40.4, width: 239, height: 159.2 },
        display,
        image,
      ),
    ).toEqual({ x: 0, y: 0, width: 480, height: 320 });
  });

  it("respeita a proporção fixa exatamente", () => {
    const rect = toImagePixels(
      { x: 70.3, y: 40, width: 160.4, height: 159.7 },
      display,
      image,
      1,
    );
    expect(rect.width).toBe(rect.height);
    expect(rect.y + rect.height).toBeLessThanOrEqual(320);
  });

  it("nunca sai da imagem", () => {
    const rect = toImagePixels(
      { x: 0, y: 0, width: 400, height: 400 },
      display,
      image,
    );
    expect(rect).toEqual({ x: 0, y: 0, width: 480, height: 320 });
  });
});

describe("resizeWithLock", () => {
  const current = { width: 400, height: 300 };

  it("com proporção travada, o outro lado acompanha", () => {
    expect(resizeWithLock(current, { width: 200 }, 4 / 3)).toEqual({
      width: 200,
      height: 150,
    });
    expect(resizeWithLock(current, { height: 90 }, 4 / 3)).toEqual({
      width: 120,
      height: 90,
    });
  });

  it("destravada, só muda o lado editado", () => {
    expect(resizeWithLock(current, { width: 100 })).toEqual({
      width: 100,
      height: 300,
    });
  });
});

describe("fitWithin", () => {
  it("reduz o maior lado até o limite, mantendo a proporção", () => {
    expect(fitWithin({ width: 4000, height: 3000 }, 1600)).toEqual({
      width: 1600,
      height: 1200,
    });
  });

  it("não aumenta imagens pequenas", () => {
    expect(fitWithin({ width: 300, height: 200 }, 1600)).toEqual({
      width: 300,
      height: 200,
    });
  });
});

describe("checkOutputSize", () => {
  it("aceita tamanhos inteiros dentro dos limites", () => {
    expect(checkOutputSize({ width: 1080, height: 1080 })).toEqual({
      ok: true,
    });
  });

  it("recusa vazio, zero ou fração", () => {
    expect(checkOutputSize({ width: 0, height: 10 })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(checkOutputSize({ width: 10.5, height: 10 })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(checkOutputSize({ width: Number.NaN, height: 10 })).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("recusa acima do lado máximo ou da área máxima", () => {
    expect(checkOutputSize({ width: 20_000, height: 10 })).toEqual({
      ok: false,
      reason: "too-large",
    });
    expect(checkOutputSize({ width: 5000, height: 5000 })).toEqual({
      ok: false,
      reason: "too-large",
    });
  });
});

describe("stepDownSizes", () => {
  it("reduz pela metade até perto do final e termina no tamanho final", () => {
    expect(
      stepDownSizes({ width: 4000, height: 3000 }, { width: 400, height: 300 }),
    ).toEqual([
      { width: 2000, height: 1500 },
      { width: 1000, height: 750 },
      { width: 500, height: 375 },
      { width: 400, height: 300 },
    ]);
  });

  it("uma etapa só quando a redução é pequena ou é aumento", () => {
    expect(
      stepDownSizes({ width: 500, height: 500 }, { width: 400, height: 400 }),
    ).toEqual([{ width: 400, height: 400 }]);
    expect(
      stepDownSizes({ width: 100, height: 100 }, { width: 300, height: 300 }),
    ).toEqual([{ width: 300, height: 300 }]);
  });

  it("não repete a etapa quando a metade já é o final", () => {
    expect(
      stepDownSizes({ width: 800, height: 600 }, { width: 400, height: 300 }),
    ).toEqual([{ width: 400, height: 300 }]);
  });
});

describe("cropPresets", () => {
  it("começa pelo corte livre e acha a proporção pelo id", () => {
    expect(cropPresets[0].ratio).toBeUndefined();
    expect(getCropPreset("4-5").ratio).toBeCloseTo(0.8);
    expect(getCropPreset("inexistente").id).toBe("free");
  });
});
