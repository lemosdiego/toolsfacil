import { describe, expect, it } from "vitest";

import {
  getAvailableTools,
  getToolBySlug,
  getToolHref,
  getToolsByCategory,
  toolCategories,
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
    "%s tem nome, descrição e uma categoria com rótulo",
    (_slug, tool) => {
      expect(tool.name.trim()).not.toBe("");
      expect(tool.shortDescription.trim()).not.toBe("");
      expect(toolCategories.map((category) => category.id)).toContain(
        tool.category,
      );
    },
  );

  it("tem categorias únicas, com rótulo em português", () => {
    const ids = toolCategories.map((category) => category.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(toolCategories.map((category) => category.label)).toEqual([
      "Converter",
      "Editar",
    ]);
  });

  it("inclui as ferramentas do MVP", () => {
    expect(tools.map((tool) => tool.slug).sort()).toEqual([
      "compactar-imagem",
      "cortador-de-imagem",
      "heic-para-jpg",
      "jpg-para-webp",
      "png-para-webp",
    ]);
  });
});

describe("consultas ao registro", () => {
  it("getToolBySlug acha a ferramenta ou devolve undefined", () => {
    expect(getToolBySlug("png-para-webp")?.name).toBe("PNG para WebP");
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

  it("getToolsByCategory devolve a categoria na ordem do registro", () => {
    expect(getToolsByCategory("convert").map((tool) => tool.slug)).toEqual([
      "png-para-webp",
      "jpg-para-webp",
      "heic-para-jpg",
    ]);
    expect(getToolsByCategory("edit").map((tool) => tool.slug)).toEqual([
      "compactar-imagem",
      "cortador-de-imagem",
    ]);
  });

  it("toda ferramenta pertence a uma das categorias do menu", () => {
    const listed = toolCategories.flatMap((category) =>
      getToolsByCategory(category.id),
    );

    expect(listed).toHaveLength(tools.length);
  });

  it("getToolHref monta a rota a partir do slug", () => {
    expect(getToolHref({ slug: "compactar-imagem" })).toBe("/compactar-imagem");
  });
});
