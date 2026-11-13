import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ErrorScreen } from "./error-screen";

describe("ErrorScreen", () => {
  it("mostra o h1 e o link para a página inicial", () => {
    render(<ErrorScreen onRetry={() => {}} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Algo deu errado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir para a página inicial" }),
    ).toHaveAttribute("href", "/");
  });

  it("chama onRetry ao tocar em Tentar de novo", () => {
    const onRetry = vi.fn();
    render(<ErrorScreen onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
