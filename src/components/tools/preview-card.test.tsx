import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PreviewCard } from "./preview-card";

describe("PreviewCard", () => {
  it("sem imagem, mostra o texto de ajuda e o download desativado", () => {
    render(<PreviewCard />);

    expect(screen.getByText("A prévia aparece aqui")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Baixar imagem" }),
    ).toBeDisabled();
  });

  it("com imagem e download, mostra a prévia e o link de download", () => {
    render(
      <PreviewCard
        image={{ src: "blob:exemplo", alt: "Prévia da imagem convertida" }}
        download={{
          href: "blob:exemplo",
          fileName: "foto.webp",
          label: "Baixar imagem em WebP",
        }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Prévia da imagem convertida" }),
    ).toHaveAttribute("src", "blob:exemplo");
    const link = screen.getByRole("link", { name: "Baixar imagem em WebP" });
    expect(link).toHaveAttribute("href", "blob:exemplo");
    expect(link).toHaveAttribute("download", "foto.webp");
    expect(screen.queryByText("A prévia aparece aqui")).not.toBeInTheDocument();
  });

  it("mostra o tamanho antes e depois e a redução", () => {
    render(<PreviewCard sizes={{ before: 1_258_291, after: 348_160 }} />);

    expect(screen.getByText("1,2 MB")).toBeInTheDocument();
    expect(screen.getByText("340 KB")).toBeInTheDocument();
    expect(screen.getByText("-72%")).toBeInTheDocument();
  });

  it("sem tamanhos, não mostra a legenda", () => {
    const { container } = render(<PreviewCard />);

    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("aceita outro conteúdo no estado vazio", () => {
    render(<PreviewCard emptyContent={<p>Arraste uma imagem</p>} />);

    expect(screen.getByText("Arraste uma imagem")).toBeInTheDocument();
    expect(screen.queryByText("A prévia aparece aqui")).not.toBeInTheDocument();
  });

  it("mostra o aviso de processamento por cima da prévia", () => {
    render(<PreviewCard busy />);

    expect(screen.getByText("Processando…")).toBeInTheDocument();
  });
});
