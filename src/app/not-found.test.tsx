import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getToolHref, tools } from "@/lib/tools";

import NotFound from "./not-found";

describe("Página não encontrada", () => {
  it("tem um único h1", () => {
    render(<NotFound />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeInTheDocument();
  });

  it("leva para a página inicial", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("link", { name: "Ir para a página inicial" }),
    ).toHaveAttribute("href", "/");
  });

  it("lista todas as ferramentas do registro, sem link nas que estão em breve", () => {
    render(<NotFound />);

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(tools.length);

    for (const tool of tools) {
      const item = within(list).getByText(tool.name);
      if (tool.status === "available") {
        expect(item.closest("a")).toHaveAttribute("href", getToolHref(tool));
      } else {
        expect(item.closest("a")).toBeNull();
        expect(item).toHaveTextContent("Em breve");
      }
    }
  });

  it("não cria outro main (o layout raiz já tem um)", () => {
    render(<NotFound />);

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
