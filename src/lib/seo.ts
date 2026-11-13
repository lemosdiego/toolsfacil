import type { Metadata } from "next";

import { siteConfig } from "./site-config";
import { getToolHref, type Tool } from "./tools";

const DEVELOPMENT_SITE_URL = "http://localhost:3000";

/**
 * URL pública do site, sem a barra final, a partir de `NEXT_PUBLIC_SITE_URL`.
 * No build de produção, a variável é obrigatória: sem ela, o sitemap, o
 * canonical e o Open Graph sairiam com `localhost` para os robôs.
 */
export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (value) return value.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL não definida. Preencha a URL pública do site no .env.local (ex.: https://toolsfacil.com.br) antes do build de produção.",
    );
  }

  return DEVELOPMENT_SITE_URL;
}

/** URL absoluta de um caminho do site (ex.: "/png-para-webp"). */
export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

/**
 * Base do Open Graph. O `openGraph` de uma página substitui o do layout
 * inteiro (sem mesclar), então toda página parte deste objeto.
 */
export const baseOpenGraph = {
  siteName: siteConfig.name,
  locale: "pt_BR",
  type: "website",
} as const;

type PageMetadataInput = {
  /** Título da página. Ganha o sufixo do site, a menos que `absoluteTitle`. */
  title: string;
  description: string;
  /** Caminho da página (ex.: "/sobre"), base do canonical. */
  path: string;
  /** Usa o título como está, sem o sufixo " | Tools Fácil" (ex.: a home). */
  absoluteTitle?: boolean;
};

/** Metadados de uma página: título, descrição, canonical e Open Graph. */
export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title, description, url: path },
  };
}

/** Metadados de uma página de ferramenta, com o caminho vindo do registro. */
export function createToolMetadata(
  tool: Pick<Tool, "slug">,
  { title, description }: { title: string; description: string },
): Metadata {
  return createPageMetadata({ title, description, path: getToolHref(tool) });
}
