import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ftypHeader, pngHeader } from "@/lib/image/test-bytes";

const setPendingFile = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/pending-file", () => ({ setPendingFile }));

// O roteador do Next não existe no jsdom: o clique só precisa do onClick.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  ),
}));

const { ImageRouter } = await import("./image-router");

function choose(file: File) {
  fireEvent.change(screen.getByTestId("image-input"), {
    target: { files: [file] },
  });
}

const png = () =>
  new File([pngHeader(800, 600), new Uint8Array(100)], "foto.png");

afterEach(() => {
  setPendingFile.mockReset();
});

describe("ImageRouter", () => {
  it("começa com o botão e os formatos aceitos", () => {
    render(<ImageRouter />);

    expect(
      screen.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/até 20 MB/)).toBeInTheDocument();
  });

  it("mostra o arquivo e só as ações que servem para PNG", async () => {
    render(<ImageRouter />);

    choose(png());

    const heading = await screen.findByRole("heading", {
      name: "O que você quer fazer?",
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent("foto.png · PNG");
    expect(
      screen.getByRole("link", { name: "Converter para WebP" }),
    ).toHaveAttribute("href", "/png-para-webp");
    // Um conversor de WebP só, mesmo com dois que aceitam PNG.
    expect(
      screen.getAllByRole("link", { name: "Converter para WebP" }),
    ).toHaveLength(1);
    // Compactar ainda não está pronta: aparece sem link.
    expect(screen.getByText("Compactar").closest("a")).toBeNull();
  });

  it("guarda o arquivo para a ferramenta ao clicar na ação", async () => {
    render(<ImageRouter />);
    const file = png();
    choose(file);

    fireEvent.click(
      await screen.findByRole("link", { name: "Converter para WebP" }),
    );

    expect(setPendingFile).toHaveBeenCalledWith(file);
  });

  it("não guarda o arquivo ao abrir a ação em nova aba", async () => {
    render(<ImageRouter />);
    choose(png());

    fireEvent.click(
      await screen.findByRole("link", { name: "Converter para WebP" }),
      { ctrlKey: true },
    );

    expect(setPendingFile).not.toHaveBeenCalled();
  });

  it("HEIC: avisa que a ferramenta ainda não está pronta", async () => {
    render(<ImageRouter />);

    choose(new File([ftypHeader("heic", ["mif1"])], "IMG_0001.HEIC"));

    expect(
      await screen.findByText(/Ainda não temos uma ferramenta pronta/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("mostra erro quando o arquivo não é imagem", async () => {
    render(<ImageRouter />);

    choose(new File(["texto"], "falso.png"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esse arquivo não parece ser uma imagem.",
    );
  });

  it("trocar a imagem abre o seletor de novo", async () => {
    render(<ImageRouter />);
    choose(png());
    const input = screen.getByTestId("image-input");
    const click = vi.spyOn(input, "click");

    fireEvent.click(
      await screen.findByRole("button", { name: "Trocar imagem" }),
    );

    expect(click).toHaveBeenCalled();
  });
});
