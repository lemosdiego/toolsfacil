import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site-config";

import Home from "./page";

describe("Página inicial", () => {
  it("exibe o nome do site vindo do site-config como título principal", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: siteConfig.name }),
    ).toBeInTheDocument();
  });

  it("exibe a descrição do site", () => {
    render(<Home />);

    expect(screen.getByText(siteConfig.description)).toBeInTheDocument();
  });
});
