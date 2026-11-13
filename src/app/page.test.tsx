import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site-config";

import { homeFaq, homeIntro } from "./home-content";
import Home from "./page";

describe("Página inicial", () => {
  it("tem um único h1, com a frase do site", () => {
    render(<Home />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: siteConfig.tagline }),
    ).toBeInTheDocument();
    expect(screen.getByText(homeIntro)).toBeInTheDocument();
  });

  it("começa pela escolha da imagem", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInTheDocument();
  });

  it("tem a grade de ferramentas e o texto com a FAQ", () => {
    render(<Home />);

    for (const title of [
      "Todas as ferramentas",
      "Como funciona",
      "Privacidade",
      "Perguntas frequentes",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: title }),
      ).toBeInTheDocument();
    }
    for (const { question } of homeFaq) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it("traz os dados estruturados WebSite e FAQPage", () => {
    const { container } = render(<Home />);
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? "[]",
    );

    expect(data.map((item: { "@type": string }) => item["@type"])).toEqual([
      "WebSite",
      "FAQPage",
    ]);
  });

  it("não cria outro main (o layout raiz já tem um)", () => {
    render(<Home />);

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
