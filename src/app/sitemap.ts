import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { sitePages } from "@/lib/site-pages";
import { getAvailableTools, getToolHref } from "@/lib/tools";

/**
 * Páginas fixas + ferramentas prontas do registro. Ferramenta "soon" não
 * entra (ela não tem rota). Sem lastModified: não há data confiável.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...sitePages, ...getAvailableTools().map(getToolHref)];

  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
