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
   * O primeiro é o formato principal da página (desempate na home).
   */
  accepts: readonly ImageMimeType[];
  /**
   * O que a ferramenta faz, como ação na home (ex.: "Converter para WebP").
   * Ferramentas com o mesmo rótulo viram uma ação só.
   */
  actionLabel: string;
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
    status: "available",
    accepts: ["image/png", "image/jpeg"],
    actionLabel: "Converter para WebP",
  },
  {
    slug: "jpg-para-webp",
    name: "JPG para WebP",
    shortDescription:
      "Transforme fotos JPG em WebP, o formato mais leve para sites e lojas.",
    category: "convert",
    status: "available",
    accepts: ["image/jpeg", "image/png"],
    actionLabel: "Converter para WebP",
  },
  {
    slug: "heic-para-jpg",
    name: "HEIC para JPG",
    shortDescription:
      "Abra as fotos do iPhone em qualquer lugar, convertendo HEIC para JPG.",
    category: "convert",
    status: "soon",
    accepts: ["image/heic"],
    actionLabel: "Converter para JPG",
  },
  {
    slug: "compactar-imagem",
    name: "Compactar imagem",
    shortDescription:
      "Reduza o tamanho em KB sem perder qualidade visível, para enviar ou publicar.",
    category: "edit",
    status: "soon",
    accepts: ["image/jpeg", "image/png", "image/webp"],
    actionLabel: "Compactar",
  },
  {
    slug: "cortador-de-imagem",
    name: "Cortar imagem",
    shortDescription:
      "Corte livre ou nas proporções das redes sociais, e ajuste as dimensões.",
    category: "edit",
    status: "soon",
    accepts: ["image/jpeg", "image/png", "image/webp"],
    actionLabel: "Cortar e redimensionar",
  },
];

export function getToolHref(tool: Pick<Tool, "slug">): string {
  return `/${tool.slug}`;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** A ferramenta do slug, ou erro no build (para as páginas das ferramentas). */
export function requireTool(slug: string): Tool {
  const tool = getToolBySlug(slug);
  if (!tool) throw new Error(`Ferramenta não registrada em tools.ts: ${slug}`);
  return tool;
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

/**
 * Ações da home para um tipo de imagem: uma por rótulo, na ordem do
 * registro. No empate (ex.: PNG serve aos dois conversores de WebP), fica a
 * ferramenta cujo formato principal é o da imagem; entre as prontas e as
 * "Em breve", a pronta vence.
 */
export function getActionsForFileType(type: ImageMimeType): Tool[] {
  const byLabel = new Map<string, Tool>();

  for (const tool of getToolsForFileType(type)) {
    const current = byLabel.get(tool.actionLabel);
    if (!current) {
      byLabel.set(tool.actionLabel, tool);
      continue;
    }
    const score = (candidate: Tool) =>
      (candidate.status === "available" ? 2 : 0) +
      (candidate.accepts[0] === type ? 1 : 0);
    if (score(tool) > score(current)) byLabel.set(tool.actionLabel, tool);
  }

  return [...byLabel.values()];
}

/** Todos os tipos aceitos por alguma ferramenta (validação da home). */
export function getAllAcceptedTypes(): ImageMimeType[] {
  return [...new Set(tools.flatMap((tool) => tool.accepts))];
}
