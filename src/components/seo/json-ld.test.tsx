import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FaqPageJsonLd } from "@/lib/structured-data";

import { JsonLd, serializeJsonLd } from "./json-ld";

const malicious: FaqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "</script><script>alert(1)</script>",
      acceptedAnswer: { "@type": "Answer", text: "ok" },
    },
  ],
};

describe("JsonLd", () => {
  it("escapa o < para um texto não fechar a tag", () => {
    const json = serializeJsonLd(malicious);

    expect(json).not.toContain("<");
    expect(json).toContain("\\u003c/script>");
    // Continua sendo o mesmo JSON depois de lido.
    expect(JSON.parse(json)).toEqual(malicious);
  });

  it("renderiza um script application/ld+json", () => {
    const { container } = render(<JsonLd data={malicious} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );

    expect(script).not.toBeNull();
    expect(script?.innerHTML).not.toContain("</script><script>");
  });
});
