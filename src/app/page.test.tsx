import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { categoryLabels, tools } from "@/lib/tools";

import Home from "./page";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Página inicial", () => {
  it("tem um único h1 com a palavra-chave principal", () => {
    render(<Home />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/Ferramentas de imagem online/);
  });

  it("mostra um card por ferramenta do registro", () => {
    render(<Home />);

    for (const tool of tools) {
      expect(
        screen.getByRole("heading", { level: 3, name: tool.name }),
      ).toBeInTheDocument();
    }
  });

  it("os atalhos por intenção apontam para cards que existem", () => {
    const { container } = render(<Home />);

    const nav = screen.getByRole("navigation", {
      name: "O que você quer fazer?",
    });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(
      expect.arrayContaining(Object.values(categoryLabels)),
    );
    for (const link of links) {
      const target = link.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
    }
  });

  it("tem as seções de conteúdo previstas", () => {
    render(<Home />);

    for (const name of [
      "Escolha uma ferramenta",
      "Como funciona",
      "Não precisa confiar: confira você mesmo",
      "Perguntas frequentes",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeVisible();
    }
  });

  it("reserva o espaço do anúncio entre as ferramentas e o texto", () => {
    render(<Home />);

    const ad = screen.getByRole("complementary", { name: "Publicidade" });
    const grid = screen.getByRole("heading", {
      name: "Escolha uma ferramenta",
    });
    const steps = screen.getByRole("heading", { name: "Como funciona" });

    expect(
      grid.compareDocumentPosition(ad) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      ad.compareDocumentPosition(steps) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
