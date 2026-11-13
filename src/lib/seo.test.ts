import { afterEach, describe, expect, it, vi } from "vitest";

import {
  absoluteUrl,
  baseOpenGraph,
  createPageMetadata,
  createToolMetadata,
  getSiteUrl,
} from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
  it("usa a variável, sem a barra final", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemplo.com.br/");

    expect(getSiteUrl()).toBe("https://exemplo.com.br");
  });

  it("usa localhost fora de produção quando a variável falta", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NODE_ENV", "development");

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("falha com mensagem clara em produção quando a variável falta", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL não definida/);
  });
});

describe("absoluteUrl", () => {
  it("junta a URL do site e o caminho, com ou sem barra", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemplo.com.br");

    expect(absoluteUrl("/png-para-webp")).toBe(
      "https://exemplo.com.br/png-para-webp",
    );
    expect(absoluteUrl("sobre")).toBe("https://exemplo.com.br/sobre");
    expect(absoluteUrl("/")).toBe("https://exemplo.com.br/");
  });
});

describe("createPageMetadata", () => {
  const input = {
    title: "Sobre",
    description: "Quem faz o site.",
    path: "/sobre",
  };

  it("define título, descrição e canonical", () => {
    const metadata = createPageMetadata(input);

    expect(metadata.title).toBe("Sobre");
    expect(metadata.description).toBe("Quem faz o site.");
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });

  it("parte do Open Graph base, sem perder o nome do site e o idioma", () => {
    const metadata = createPageMetadata(input);

    expect(metadata.openGraph).toEqual({
      ...baseOpenGraph,
      title: "Sobre",
      description: "Quem faz o site.",
      url: "/sobre",
    });
  });

  it("aceita título sem o sufixo do site", () => {
    const metadata = createPageMetadata({ ...input, absoluteTitle: true });

    expect(metadata.title).toEqual({ absolute: "Sobre" });
  });
});

describe("createToolMetadata", () => {
  it("usa o caminho do registro como canonical", () => {
    const metadata = createToolMetadata(
      { slug: "png-para-webp" },
      { title: "Converter PNG para WebP", description: "Descrição." },
    );

    expect(metadata.alternates?.canonical).toBe("/png-para-webp");
    expect(metadata.openGraph).toMatchObject({ url: "/png-para-webp" });
  });
});
