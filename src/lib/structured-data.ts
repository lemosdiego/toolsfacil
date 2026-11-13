import { absoluteUrl } from "./seo";
import { siteConfig } from "./site-config";
import { getToolHref, type Tool } from "./tools";

/*
 * Montadores de dados estruturados (schema.org), com tipos próprios mínimos.
 * Nunca inclua avaliações, notas ou número de usuários.
 */

type SchemaContext = { "@context": "https://schema.org" };

export type WebApplicationJsonLd = SchemaContext & {
  "@type": "WebApplication";
  name: string;
  description: string;
  url: string;
  applicationCategory: "MultimediaApplication";
  operatingSystem: string;
  inLanguage: "pt-BR";
  isAccessibleForFree: true;
  offers: { "@type": "Offer"; price: "0"; priceCurrency: "BRL" };
};

export type FaqItem = { question: string; answer: string };

export type FaqPageJsonLd = SchemaContext & {
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
};

export type WebSiteJsonLd = SchemaContext & {
  "@type": "WebSite";
  name: string;
  description: string;
  url: string;
  inLanguage: "pt-BR";
};

export type JsonLdObject = WebApplicationJsonLd | FaqPageJsonLd | WebSiteJsonLd;

const context = "https://schema.org" as const;

/** A ferramenta como aplicação web gratuita, que roda no navegador. */
export function webApplicationJsonLd(
  tool: Pick<Tool, "slug">,
  { name, description }: { name: string; description: string },
): WebApplicationJsonLd {
  return {
    "@context": context,
    "@type": "WebApplication",
    name,
    description,
    url: absoluteUrl(getToolHref(tool)),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Qualquer (navegador)",
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
  };
}

/** Perguntas frequentes da página (as mesmas que aparecem no texto). */
export function faqPageJsonLd(items: readonly FaqItem[]): FaqPageJsonLd {
  return {
    "@context": context,
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** O site como um todo (usado na home). */
export function webSiteJsonLd(): WebSiteJsonLd {
  return {
    "@context": context,
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    inLanguage: "pt-BR",
  };
}
