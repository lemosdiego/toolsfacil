import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getToolHref, tools } from "@/lib/tools";

import robots from "./robots";
import sitemap from "./sitemap";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemplo.com.br");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitemap", () => {
  it("inclui a home com URL absoluta", () => {
    expect(sitemap()).toContainEqual({ url: "https://exemplo.com.br/" });
  });

  it("inclui só as ferramentas prontas", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const tool of tools) {
      const url = `https://exemplo.com.br${getToolHref(tool)}`;
      if (tool.status === "available") {
        expect(urls).toContain(url);
      } else {
        expect(urls).not.toContain(url);
      }
    }
  });
});

describe("robots", () => {
  it("bloqueia /api/ e aponta para o sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://exemplo.com.br/sitemap.xml",
    });
  });
});
