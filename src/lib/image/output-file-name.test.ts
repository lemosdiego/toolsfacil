import { describe, expect, it } from "vitest";

import { getOutputFileName } from "./output-file-name";

describe("getOutputFileName", () => {
  it("troca a extensão", () => {
    expect(getOutputFileName("foto.png", { extension: "webp" })).toBe(
      "foto.webp",
    );
  });

  it("acrescenta o sufixo antes da extensão", () => {
    expect(
      getOutputFileName("foto.jpg", { extension: "jpg", suffix: "cortada" }),
    ).toBe("foto-cortada.jpg");
  });

  it("aceita extensão em maiúsculas ou com ponto", () => {
    expect(getOutputFileName("FOTO.PNG", { extension: ".WEBP" })).toBe(
      "FOTO.webp",
    );
  });

  it("tira só a última extensão", () => {
    expect(
      getOutputFileName("minha.foto.final.jpeg", { extension: "webp" }),
    ).toBe("minha.foto.final.webp");
  });

  it("mantém acentos e espaços do nome", () => {
    expect(
      getOutputFileName("Férias  na praia.jpg", { extension: "webp" }),
    ).toBe("Férias na praia.webp");
  });

  it("tira caracteres proibidos e pastas", () => {
    expect(getOutputFileName('a:b*c?"d<e>|f.png', { extension: "webp" })).toBe(
      "a-b-c-d-e-f.webp",
    );
    expect(
      getOutputFileName("C:\\fotos\\gato.png", { extension: "webp" }),
    ).toBe("gato.webp");
  });

  it('usa "imagem" quando não sobra nome', () => {
    expect(getOutputFileName("", { extension: "webp" })).toBe("imagem.webp");
    expect(getOutputFileName(".png", { extension: "webp" })).toBe(
      "imagem.webp",
    );
    expect(getOutputFileName("???.png", { extension: "webp" })).toBe(
      "imagem.webp",
    );
  });

  it("corta nomes muito longos", () => {
    const name = getOutputFileName(`${"a".repeat(300)}.png`, {
      extension: "webp",
    });
    expect(name).toBe(`${"a".repeat(100)}.webp`);
  });
});
