import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert", () => {
  it("usa role=alert para erros", () => {
    render(
      <Alert variant="error" title="Arquivo muito grande">
        Escolha uma imagem de até 20 MB.
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Arquivo muito grande");
    expect(alert).toHaveTextContent("Escolha uma imagem de até 20 MB.");
  });

  it.each(["info", "success"] as const)(
    "usa role=status na variante %s",
    (variant) => {
      render(<Alert variant={variant}>Pronto.</Alert>);

      expect(screen.getByRole("status")).toHaveTextContent("Pronto.");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("deixa o ícone fora da árvore de acessibilidade", () => {
    render(<Alert>Mensagem</Alert>);

    expect(screen.getByRole("status").querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
