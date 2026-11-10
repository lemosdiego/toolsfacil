import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  it("mantém o texto no DOM com a classe sr-only", () => {
    render(<VisuallyHidden>Abrir menu</VisuallyHidden>);

    expect(screen.getByText("Abrir menu")).toHaveClass("sr-only");
  });
});
