import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { siteConfig } from "@/lib/site-config";
import { toolCategories, tools } from "@/lib/tools";

import { SiteHeader, TOOLS_MENU_ID } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("SiteHeader", () => {
  it("leva para a home pelo nome do site", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: siteConfig.name })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("abre o menu pela Popover API", () => {
    render(<SiteHeader />);

    const button = screen.getByRole("button", { name: "Ferramentas" });
    expect(button).toHaveAttribute("popovertarget", TOOLS_MENU_ID);
    expect(document.getElementById(TOOLS_MENU_ID)).toHaveAttribute(
      "popover",
      "auto",
    );
  });

  it("coloca as categorias e as ferramentas dentro do menu", () => {
    render(<SiteHeader />);

    const menu = document.getElementById(TOOLS_MENU_ID);
    if (!menu) throw new Error("menu não encontrado");

    for (const category of toolCategories) {
      expect(within(menu).getByText(category.label)).toBeInTheDocument();
    }
    for (const tool of tools) {
      expect(within(menu).getByText(tool.name)).toBeInTheDocument();
    }
  });
});
