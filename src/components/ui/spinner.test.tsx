import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("anuncia o rótulo com role=status", () => {
    render(<Spinner label="Convertendo imagem" />);

    expect(screen.getByRole("status")).toHaveTextContent("Convertendo imagem");
  });

  it("sem rótulo, é só decorativo", () => {
    const { container } = render(<Spinner />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
