import { describe, expect, it } from "vitest";

import {
  categoryLabels,
  getAvailableTools,
  getToolBySlug,
  getToolHref,
  getToolsByCategory,
  getToolsForDisplay,
  tools,
} from "./tools";

describe("registro de ferramentas", () => {
  it("tem slugs únicos", () => {
    const slugs = tools.map((tool) => tool.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(tools.map((tool) => [tool.slug]))(
    "o slug %s está em kebab-case, sem acentos",
    (slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    },
  );

  it.each(tools.map((tool) => [tool.slug, tool]))(
    "%s tem todos os campos obrigatórios",
    (_slug, tool) => {
      expect(tool.name.trim()).not.toBe("");
      expect(tool.shortDescription.trim()).not.toBe("");
      expect(tool.icon).toBeTruthy();
      expect(Object.keys(categoryLabels)).toContain(tool.category);
      expect(tool.transformation.from.length).toBeGreaterThan(0);
      expect(tool.transformation.to.length).toBeGreaterThan(0);
    },
  );

  it("tem no máximo uma ferramenta em destaque", () => {
    expect(tools.filter((tool) => tool.featured).length).toBeLessThanOrEqual(1);
  });

  it("inclui as quatro ferramentas do MVP", () => {
    expect(tools.map((tool) => tool.slug).sort()).toEqual([
      "compactar-imagem",
      "converter-webp",
      "cortador-de-imagem",
      "heic-para-jpg",
    ]);
  });
});

describe("consultas ao registro", () => {
  it("getToolBySlug acha a ferramenta ou devolve undefined", () => {
    expect(getToolBySlug("converter-webp")?.name).toBe("Converter para WebP");
    expect(getToolBySlug("nao-existe")).toBeUndefined();
  });

  it("getAvailableTools só devolve ferramentas disponíveis", () => {
    for (const tool of getAvailableTools()) {
      expect(tool.status).toBe("available");
    }
    expect(getAvailableTools().length).toBe(
      tools.filter((tool) => tool.status === "available").length,
    );
  });

  it("getToolsByCategory filtra pela categoria", () => {
    const converters = getToolsByCategory("convert");

    expect(converters.map((tool) => tool.slug)).toEqual([
      "converter-webp",
      "heic-para-jpg",
    ]);
  });

  it("getToolsForDisplay coloca a ferramenta de destaque primeiro", () => {
    const display = getToolsForDisplay();

    expect(display[0]?.featured).toBe(true);
    expect(display).toHaveLength(tools.length);
  });

  it("getToolHref monta a rota a partir do slug", () => {
    expect(getToolHref({ slug: "compactar-imagem" })).toBe("/compactar-imagem");
  });
});
