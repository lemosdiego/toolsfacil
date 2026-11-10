import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

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

  it("lista todas as ferramentas do registro no menu", () => {
    render(<SiteHeader />);

    const nav = screen.getByRole("navigation", {
      name: "Ferramentas",
      hidden: true,
    });
    for (const tool of tools) {
      expect(within(nav).getByText(tool.name)).toBeInTheDocument();
    }
  });

  it("não cria link para ferramentas que ainda não existem", () => {
    render(<SiteHeader />);

    for (const tool of tools.filter((item) => item.status === "soon")) {
      expect(
        screen.queryByRole("link", {
          name: new RegExp(tool.name),
          hidden: true,
        }),
      ).not.toBeInTheDocument();
    }
  });
});
