/**
 * Registro único das ferramentas (fonte da verdade).
 * O menu (e depois o sitemap) leem daqui: ferramenta nova entra só neste
 * arquivo. Quando a fase da ferramenta terminar, troque o status para
 * "available" (só então ela vira link).
 */

import type { ImageMimeType } from "./image/detect-image-type";

export type ToolCategory = "convert" | "edit";

export type ToolStatus = "available" | "soon";

export type Tool = {
  /** Segmento da rota, em português (slug de SEO). Não mude depois de publicado. */
  slug: string;
  /** Nome curto, mostrado no menu (ex.: "PNG para WebP"). */
  name: string;
  shortDescription: string;
  category: ToolCategory;
  status: ToolStatus;
  /**
   * Tipos reais de imagem (pelos bytes) que a ferramenta aceita. Usado na
   * validação, no `accept` do seletor e para sugerir a ferramenta certa.
   */
  accepts: readonly ImageMimeType[];
};

/** Categorias na ordem das colunas do menu, com o rótulo em português. */
export const toolCategories: readonly {
  id: ToolCategory;
  label: string;
}[] = [
  { id: "convert", label: "Converter" },
  { id: "edit", label: "Editar" },
];

export const tools: readonly Tool[] = [
  {
    slug: "png-para-webp",
    name: "PNG para WebP",
    shortDescription:
      "Transforme PNG em WebP, mais leve e com fundo transparente preservado.",
    category: "convert",
    status: "soon",
    accepts: ["image/png", "image/jpeg"],
  },
  {
    slug: "jpg-para-webp",
    name: "JPG para WebP",
    shortDescription:
      "Transforme fotos JPG em WebP, o formato mais leve para sites e lojas.",
    category: "convert",
    status: "soon",
    accepts: ["image/png", "image/jpeg"],
  },
  {
    slug: "heic-para-jpg",
    name: "HEIC para JPG",
    shortDescription:
      "Abra as fotos do iPhone em qualquer lugar, convertendo HEIC para JPG.",
    category: "convert",
    status: "soon",
    accepts: ["image/heic"],
  },
  {
    slug: "compactar-imagem",
    name: "Compactar imagem",
    shortDescription:
      "Reduza o tamanho em KB sem perder qualidade visível, para enviar ou publicar.",
    category: "edit",
    status: "soon",
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    slug: "cortador-de-imagem",
    name: "Cortar imagem",
    shortDescription:
      "Corte livre ou nas proporções das redes sociais, e ajuste as dimensões.",
    category: "edit",
    status: "soon",
    accepts: ["image/jpeg", "image/png", "image/webp"],
  },
];

export function getToolHref(tool: Pick<Tool, "slug">): string {
  return `/${tool.slug}`;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getAvailableTools(): Tool[] {
  return tools.filter((tool) => tool.status === "available");
}

/** Ferramentas de uma categoria, na ordem do registro. */
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/**
 * Ferramentas que aceitam um tipo de imagem, na ordem do registro (para
 * sugerir a ferramenta certa quando o arquivo não serve para a atual).
 */
export function getToolsForFileType(type: ImageMimeType): Tool[] {
  return tools.filter((tool) => tool.accepts.includes(type));
}
