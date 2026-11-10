import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getToolsByCategory, toolCategories, tools } from "@/lib/tools";

import { ToolsMenu } from "./tools-menu";

describe("ToolsMenu", () => {
  it("é uma navegação com nome acessível", () => {
    render(<ToolsMenu />);

    expect(
      screen.getByRole("navigation", { name: "Ferramentas" }),
    ).toBeInTheDocument();
  });

  it.each(toolCategories.map((category) => [category.label, category.id]))(
    "a coluna %s lista as ferramentas da categoria, na ordem do registro",
    (label, id) => {
      render(<ToolsMenu />);

      const list = screen.getByRole("list", { name: label });
      const names = within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent?.replace("Em breve", "").trim());

      expect(names).toEqual(getToolsByCategory(id).map((tool) => tool.name));
    },
  );

  it("tem a coluna Em breve, sem inventar ferramentas", () => {
    render(<ToolsMenu />);

    expect(screen.getByText("Em breve", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Novas ferramentas chegando.")).toBeInTheDocument();
  });

  it("não cria link para ferramentas que ainda não existem", () => {
    render(<ToolsMenu />);

    const soonCount = tools.filter((tool) => tool.status === "soon").length;
    expect(screen.queryAllByRole("link")).toHaveLength(
      tools.length - soonCount,
    );
  });
});
