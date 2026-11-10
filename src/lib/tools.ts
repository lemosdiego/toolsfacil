import {
  Crop,
  FileImage,
  ImageDown,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/**
 * Registro único das ferramentas (fonte da verdade).
 * Home, menu, footer e sitemap leem daqui: ferramenta nova entra só neste
 * arquivo. Quando a fase da ferramenta terminar, troque o status para
 * "available" (só então ela vira link).
 */

export type ToolCategory = "convert" | "resize" | "compress";

export type ToolStatus = "available" | "soon";

export type Tool = {
  /** Segmento da rota, em português (slug de SEO). Não mude depois de publicado. */
  slug: string;
  name: string;
  shortDescription: string;
  icon: LucideIcon;
  category: ToolCategory;
  /** O que entra e o que sai, mostrado nos cards (ex.: PNG, JPG → WebP). */
  transformation: { from: readonly string[]; to: readonly string[] };
  status: ToolStatus;
  /** Card maior na home. Use em no máximo uma ferramenta. */
  featured?: boolean;
};

export const categoryLabels: Record<ToolCategory, string> = {
  convert: "Converter",
  resize: "Cortar",
  compress: "Compactar",
};

export const tools: readonly Tool[] = [
  {
    slug: "converter-webp",
    name: "Converter para WebP",
    shortDescription:
      "Transforme PNG e JPG em WebP, o formato mais leve para sites e lojas.",
    icon: FileImage,
    category: "convert",
    transformation: { from: ["PNG", "JPG"], to: ["WebP"] },
    status: "soon",
    featured: true,
  },
  {
    slug: "compactar-imagem",
    name: "Compactar imagem",
    shortDescription:
      "Reduza o tamanho em KB sem perder qualidade visível, para enviar ou publicar.",
    icon: ImageDown,
    category: "compress",
    transformation: { from: ["JPG", "PNG", "WebP"], to: ["Menos KB"] },
    status: "soon",
  },
  {
    slug: "cortador-de-imagem",
    name: "Cortar e redimensionar",
    shortDescription:
      "Corte livre ou nas proporções das redes sociais, e ajuste as dimensões.",
    icon: Crop,
    category: "resize",
    transformation: { from: ["Qualquer tamanho"], to: ["1:1", "4:5", "9:16"] },
    status: "soon",
  },
  {
    slug: "heic-para-jpg",
    name: "Converter HEIC para JPG",
    shortDescription:
      "Abra as fotos do iPhone em qualquer lugar, convertendo HEIC para JPG.",
    icon: Smartphone,
    category: "convert",
    transformation: { from: ["HEIC"], to: ["JPG"] },
    status: "soon",
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

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** Ferramentas em ordem de exibição: a de destaque primeiro. */
export function getToolsForDisplay(): Tool[] {
  return [...tools].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}
