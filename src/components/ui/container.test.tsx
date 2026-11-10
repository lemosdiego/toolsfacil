import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "./container";

describe("Container", () => {
  it("renderiza uma div com a largura de conteúdo por padrão", () => {
    render(<Container data-testid="c">Conteúdo</Container>);

    const element = screen.getByTestId("c");
    expect(element.tagName).toBe("DIV");
    expect(element).toHaveClass("max-w-content", "mx-auto");
  });

  it("aceita outra tag, largura de texto e classes extras", () => {
    render(
      <Container as="main" width="prose" className="py-8">
        Conteúdo
      </Container>,
    );

    const element = screen.getByRole("main");
    expect(element).toHaveClass("max-w-prose", "py-8");
    expect(element).not.toHaveClass("max-w-content");
  });
});
