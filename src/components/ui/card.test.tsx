import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

describe("Card", () => {
  it("renderiza uma div com a superfície e a sombra do tema", () => {
    render(<Card data-testid="card">Conteúdo</Card>);

    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass("bg-surface", "rounded-card", "shadow-card");
  });

  it("aceita outra tag e sobrescreve o espaçamento", () => {
    render(
      <Card as="article" className="p-2">
        Conteúdo
      </Card>,
    );

    const card = screen.getByRole("article");
    expect(card).toHaveClass("p-2");
    expect(card).not.toHaveClass("p-5");
  });
});
