import { render, screen } from "@testing-library/react";
import { X } from "lucide-react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("expõe o nome acessível pelo aria-label", () => {
    render(
      <IconButton aria-label="Remover arquivo">
        <X />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Remover arquivo" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("size-11");
  });

  it("deixa o ícone fora da árvore de acessibilidade", () => {
    const { container } = render(
      <IconButton aria-label="Fechar">
        <X />
      </IconButton>,
    );

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("exige aria-label pelo tipo", () => {
    // @ts-expect-error: aria-label é obrigatório
    render(<IconButton>{null}</IconButton>);
  });
});
