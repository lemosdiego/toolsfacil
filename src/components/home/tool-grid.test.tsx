import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getToolHref, toolCategories, tools } from "@/lib/tools";

import { ToolGrid } from "./tool-grid";

describe("ToolGrid", () => {
  it("tem uma seção por categoria, com o rótulo como h3", () => {
    render(<ToolGrid />);

    for (const category of toolCategories) {
      expect(
        screen.getByRole("heading", { level: 3, name: category.label }),
      ).toBeInTheDocument();
    }
  });

  it("mostra todas as ferramentas; só as prontas são links", () => {
    render(<ToolGrid />);

    for (const tool of tools) {
      const name = screen.getByText(tool.name);
      const link = name.closest("a");
      if (tool.status === "available") {
        expect(link).toHaveAttribute("href", getToolHref(tool));
      } else {
        expect(link).toBeNull();
        expect(
          within(name.closest("div") as HTMLElement).getByText("Em breve"),
        ).toBeInTheDocument();
      }
    }
  });
});
