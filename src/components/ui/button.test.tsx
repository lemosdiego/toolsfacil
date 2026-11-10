import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renderiza um <button> do tipo button por padrão", () => {
    render(<Button>Converter</Button>);

    const button = screen.getByRole("button", { name: "Converter" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-primary", "min-h-11");
  });

  it("aplica variante e tamanho", () => {
    render(
      <Button variant="secondary" size="lg">
        Cancelar
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-surface", "min-h-12");
    expect(button).not.toHaveClass("bg-primary");
  });

  it("fica desabilitado e com aria-busy durante o carregamento", () => {
    render(<Button loading>Processando</Button>);

    const button = screen.getByRole("button", { name: "Processando" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("não marca aria-busy fora do carregamento", () => {
    render(<Button disabled>Indisponível</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("vira link quando recebe href, com o mesmo visual", () => {
    render(
      <Button href="/converter-webp" variant="ghost">
        Abrir ferramenta
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Abrir ferramenta" });
    expect(link).toHaveAttribute("href", "/converter-webp");
    expect(link).toHaveClass("min-h-11");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
