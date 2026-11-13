import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

/** Libera tudo, menos as rotas de API, e aponta para o sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
