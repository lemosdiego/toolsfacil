import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site-config";
import { getToolHref, tools } from "@/lib/tools";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("lista as ferramentas do registro", () => {
    render(<SiteFooter />);

    const nav = screen.getByRole("navigation", {
      name: "Ferramentas no rodapé",
    });
    for (const tool of tools) {
      expect(within(nav).getByText(new RegExp(tool.name))).toBeInTheDocument();
    }
  });

  it("só cria link para ferramentas disponíveis", () => {
    render(<SiteFooter />);

    const hrefs = screen
      .queryAllByRole("link")
      .map((link) => link.getAttribute("href"));
    const expected = tools
      .filter((tool) => tool.status === "available")
      .map(getToolHref);
    expect(hrefs).toEqual(expected);
  });

  it("mostra o aviso de privacidade e o nome do site", () => {
    render(<SiteFooter />);

    expect(screen.getByText(/nunca são enviados/)).toBeInTheDocument();
    expect(
      screen.getByText(`© ${siteConfig.name}.`, { exact: false }),
    ).toBeInTheDocument();
  });
});
