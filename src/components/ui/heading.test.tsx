import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./heading";

describe("Heading", () => {
  it.each([1, 2, 3] as const)("renderiza a tag h%i", (level) => {
    render(<Heading level={level}>Título</Heading>);

    expect(
      screen.getByRole("heading", { level, name: "Título" }),
    ).toBeVisible();
  });

  it("usa o tamanho do nível por padrão", () => {
    render(<Heading level={2}>Seção</Heading>);

    expect(screen.getByRole("heading")).toHaveClass("text-2xl");
  });

  it("permite tamanho visual diferente da tag", () => {
    render(
      <Heading level={1} size="md">
        Pequeno
      </Heading>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-lg");
    expect(heading).not.toHaveClass("text-3xl");
  });
});
