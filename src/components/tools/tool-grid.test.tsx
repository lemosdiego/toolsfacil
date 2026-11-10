import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getToolsForDisplay } from "@/lib/tools";

import { ToolGrid } from "./tool-grid";

describe("ToolGrid", () => {
  const tools = getToolsForDisplay();

  it("renderiza um item por ferramenta, na ordem recebida", () => {
    render(<ToolGrid tools={tools} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(
      tools.map((tool) => tool.name),
    );
  });

  it("a ferramenta de destaque ocupa a linha inteira", () => {
    render(<ToolGrid tools={tools} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("sm:col-span-2", "lg:col-span-3");
  });

  it("o último card sozinho na linha ocupa as duas colunas no tablet", () => {
    render(<ToolGrid tools={tools} />);

    const items = screen.getAllByRole("listitem");
    expect(items.at(-1)).toHaveClass("sm:col-span-2");
  });
});
