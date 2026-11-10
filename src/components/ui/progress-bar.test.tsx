import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("expõe o valor e o nome acessível", () => {
    render(<ProgressBar value={42.4} label="Progresso da conversão" />);

    const bar = screen.getByRole("progressbar", {
      name: "Progresso da conversão",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it.each([
    [-10, "0"],
    [150, "100"],
    [Number.NaN, "0"],
  ])("ajusta o valor %s para %s", (value, expected) => {
    render(<ProgressBar value={value} label="Progresso" />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      expected,
    );
  });

  it("mostra a porcentagem quando pedido", () => {
    render(<ProgressBar value={75} label="Processando" showValue />);

    expect(screen.getByText("75%")).toBeVisible();
  });
});
