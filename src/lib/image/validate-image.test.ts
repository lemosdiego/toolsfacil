import { describe, expect, it } from "vitest";

import { MAX_FILE_SIZE } from "./image-limits";
import { validateImage, type ImageInspection } from "./validate-image";

const pngOnly = ["image/png"] as const;

function inspection(overrides: Partial<ImageInspection>): ImageInspection {
  return {
    size: 1000,
    type: "image/png",
    dimensions: { width: 800, height: 600 },
    ...overrides,
  };
}

function errorOf(result: ReturnType<typeof validateImage>) {
  if (result.ok) throw new Error("esperava erro");
  return result.error;
}

describe("validateImage", () => {
  it("aceita uma imagem do tipo certo dentro dos limites", () => {
    expect(validateImage(inspection({}), pngOnly)).toEqual({
      ok: true,
      type: "image/png",
      dimensions: { width: 800, height: 600 },
    });
  });

  it("recusa arquivo vazio", () => {
    expect(errorOf(validateImage(inspection({ size: 0 }), pngOnly)).code).toBe(
      "empty-file",
    );
  });

  it("recusa arquivo acima de 20 MB, com o tamanho e o limite", () => {
    const error = errorOf(
      validateImage(inspection({ size: MAX_FILE_SIZE + 1 }), pngOnly),
    );

    expect(error.code).toBe("file-too-large");
    expect(error.message).toBe(
      "A imagem tem mais de 20 MB, e o limite é 20 MB. Escolha um arquivo menor.",
    );
  });

  it("confere o tamanho antes do tipo", () => {
    const error = errorOf(
      validateImage(
        inspection({ size: MAX_FILE_SIZE * 2, type: undefined }),
        pngOnly,
      ),
    );

    expect(error.code).toBe("file-too-large");
    expect(error.message).toContain("40 MB");
  });

  it("recusa o que não é imagem, dizendo os formatos aceitos", () => {
    const error = errorOf(
      validateImage(inspection({ type: undefined }), [
        "image/png",
        "image/jpeg",
      ]),
    );

    expect(error.code).toBe("unknown-type");
    expect(error.message).toBe(
      "Esse arquivo não parece ser uma imagem. Escolha um arquivo PNG ou JPG.",
    );
  });

  it("recusa outro tipo e sugere a ferramenta certa", () => {
    const error = errorOf(
      validateImage(
        inspection({ type: "image/heic", dimensions: undefined }),
        pngOnly,
      ),
    );

    expect(error.code).toBe("wrong-type");
    expect(error.suggestedTool?.slug).toBe("heic-para-jpg");
    expect(error.message).toContain("foto HEIC (formato do iPhone)");
    expect(error.message).toContain('"HEIC para JPG"');
  });

  it("recusa outro tipo sem sugestão quando nenhuma ferramenta serve", () => {
    const error = errorOf(
      validateImage(inspection({ type: "image/gif" }), pngOnly),
    );

    expect(error.suggestedTool).toBeUndefined();
    expect(error.message).toBe(
      "Esse arquivo é uma imagem GIF, e aqui só dá para usar PNG.",
    );
  });

  it("recusa imagem acima da área máxima, com as dimensões", () => {
    const error = errorOf(
      validateImage(
        inspection({ dimensions: { width: 5000, height: 4000 } }),
        pngOnly,
      ),
    );

    expect(error.code).toBe("too-many-pixels");
    expect(error.message).toContain("5.000 × 4.000 pixels");
    expect(error.message).toContain("4096 × 4096");
  });

  it("aceita exatamente a área máxima", () => {
    expect(
      validateImage(
        inspection({ dimensions: { width: 4096, height: 4096 } }),
        pngOnly,
      ).ok,
    ).toBe(true);
  });

  it("recusa lado acima de 16.384 pixels, mesmo com área pequena", () => {
    const error = errorOf(
      validateImage(
        inspection({ dimensions: { width: 20_000, height: 100 } }),
        pngOnly,
      ),
    );

    expect(error.code).toBe("side-too-large");
    expect(error.message).toContain("16.384 pixels");
  });

  it("deixa passar dimensões desconhecidas (a decodificação confere)", () => {
    expect(
      validateImage(inspection({ dimensions: undefined }), pngOnly).ok,
    ).toBe(true);
  });
});
