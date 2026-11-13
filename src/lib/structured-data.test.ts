import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { siteConfig } from "./site-config";
import {
  faqPageJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from "./structured-data";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://exemplo.com.br");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("webApplicationJsonLd", () => {
  function buildData() {
    return webApplicationJsonLd(
      { slug: "png-para-webp" },
      {
        name: "Converter PNG para WebP",
        description: "Converte no navegador.",
      },
    );
  }

  it("descreve a ferramenta com URL absoluta e gratuita", () => {
    expect(buildData()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Converter PNG para WebP",
      url: "https://exemplo.com.br/png-para-webp",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    });
  });

  it("não inventa avaliações nem número de usuários", () => {
    const data = buildData();

    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
    expect(data).not.toHaveProperty("interactionStatistic");
  });
});

describe("faqPageJsonLd", () => {
  it("transforma as perguntas em Question com Answer", () => {
    const data = faqPageJsonLd([
      { question: "É grátis?", answer: "Sim." },
      { question: "A imagem sai do aparelho?", answer: "Não." },
    ]);

    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "É grátis?",
        acceptedAnswer: { "@type": "Answer", text: "Sim." },
      },
      {
        "@type": "Question",
        name: "A imagem sai do aparelho?",
        acceptedAnswer: { "@type": "Answer", text: "Não." },
      },
    ]);
  });
});

describe("webSiteJsonLd", () => {
  it("usa o nome do site e a URL da home", () => {
    expect(webSiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      name: siteConfig.name,
      url: "https://exemplo.com.br/",
    });
  });
});
