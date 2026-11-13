import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe("Tela de erro", () => {
  it("não mostra a mensagem do erro", () => {
    render(
      <ErrorPage error={new Error("foto-secreta.png")} retry={() => {}} />,
    );

    expect(screen.queryByText(/foto-secreta/)).not.toBeInTheDocument();
  });

  it("tenta de novo com o retry do Next", () => {
    const retry = vi.fn();
    render(<ErrorPage error={new Error("falha")} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("não cria outro main (o layout raiz já tem um)", () => {
    render(<ErrorPage error={new Error("falha")} retry={() => {}} />);

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
