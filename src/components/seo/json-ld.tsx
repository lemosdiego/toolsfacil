import type { JsonLdObject } from "@/lib/structured-data";

/** Serializa o JSON-LD escapando `<`, para um texto nunca fechar a tag. */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Dados estruturados da página. Único lugar do site com
 * `dangerouslySetInnerHTML` (a regra do ESLint libera só este arquivo).
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
