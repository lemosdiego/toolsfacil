import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { bytesOf, pngHeader, uint16 } from "@/lib/image/test-bytes";

const processImage = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/process-image", () => ({
  processImage,
  disposeImageWorker: vi.fn(),
}));

const canEncode = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/can-encode", () => ({ canEncode }));

const { ImageCompressor } = await import("./image-compressor");

/** Cabeçalho mínimo de JPG (SOI + SOF0) com as dimensões. */
function jpegHeader(width: number, height: number) {
  return bytesOf(
    [0xff, 0xd8, 0xff, 0xc0],
    uint16(17),
    [8],
    uint16(height),
    uint16(width),
    [3],
  );
}

function chooseFile(kind: "jpg" | "png", size = 1000) {
  const header = kind === "jpg" ? jpegHeader(400, 300) : pngHeader(400, 300);
  const file = new File(
    [header, new Uint8Array(size - header.length)],
    kind === "jpg" ? "foto.jpg" : "logo.png",
  );
  fireEvent.change(screen.getByTestId("image-input"), {
    target: { files: [file] },
  });
}

function result(
  size: number,
  type = "image/jpeg",
  extra: { quality?: number; fitsMaxBytes?: boolean } = {},
) {
  return {
    blob: new Blob([new Uint8Array(size)], { type }),
    width: 400,
    height: 300,
    ...extra,
  };
}

async function advance(ms = 400) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  canEncode.mockResolvedValue(true);
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:resultado"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  processImage.mockReset();
});

describe("ImageCompressor", () => {
  it("compacta o JPG no mesmo formato, com qualidade 75, e baixa foto-compactada.jpg", async () => {
    processImage.mockResolvedValue(result(300));
    render(<ImageCompressor />);

    chooseFile("jpg");

    expect(
      await screen.findByRole("link", { name: "Baixar imagem em JPG" }),
    ).toHaveAttribute("download", "foto-compactada.jpg");
    expect(processImage).toHaveBeenCalledWith(expect.any(File), {
      type: "image/jpeg",
      encoder: "canvas",
      quality: 0.75,
    });
  });

  it("tem o controle de qualidade de 40 a 95 com nome acessível", () => {
    render(<ImageCompressor />);

    const slider = screen.getByRole("slider", { name: "Qualidade" });
    expect(slider).toHaveValue("75");
    expect(slider).toHaveAttribute("min", "40");
    expect(slider).toHaveAttribute("max", "95");
  });

  it("compacta de novo quando a pessoa para de mexer na qualidade", async () => {
    processImage.mockResolvedValue(result(300));
    render(<ImageCompressor />);
    chooseFile("jpg");
    await screen.findByRole("link", { name: "Baixar imagem em JPG" });

    vi.useFakeTimers();
    const slider = screen.getByRole("slider", { name: "Qualidade" });
    fireEvent.change(slider, { target: { value: "60" } });
    fireEvent.change(slider, { target: { value: "50" } });
    await advance();

    expect(processImage).toHaveBeenCalledTimes(2);
    expect(processImage).toHaveBeenLastCalledWith(
      expect.any(File),
      expect.objectContaining({ quality: 0.5 }),
    );
  });

  it("no modo Tamanho máximo, usa o atalho escolhido", async () => {
    processImage.mockResolvedValue(result(300));
    render(<ImageCompressor />);
    chooseFile("jpg");
    await screen.findByRole("link", { name: "Baixar imagem em JPG" });

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("radio", { name: "Tamanho máximo" }));
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "100 KB" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "500 KB" }));
    await advance();

    expect(processImage).toHaveBeenLastCalledWith(expect.any(File), {
      type: "image/jpeg",
      encoder: "canvas",
      maxBytes: 512_000,
    });
  });

  it("aceita outro tamanho em KB e avisa quando o valor é inválido", async () => {
    render(<ImageCompressor />);

    fireEvent.click(screen.getByRole("radio", { name: "Tamanho máximo" }));
    fireEvent.click(screen.getByRole("radio", { name: "Outro" }));
    const input = screen.getByRole("textbox", { name: "Tamanho em KB" });

    fireEvent.change(input, { target: { value: "abc" } });
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(input, { target: { value: "300" } });
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("mostra a qualidade usada quando cabe no tamanho máximo", async () => {
    processImage.mockResolvedValue(
      result(300, "image/jpeg", { quality: 0.62, fitsMaxBytes: true }),
    );
    render(<ImageCompressor />);
    fireEvent.click(screen.getByRole("radio", { name: "Tamanho máximo" }));

    chooseFile("jpg");

    expect(await screen.findByText("Qualidade usada:")).toBeInTheDocument();
    expect(screen.getByText("62")).toBeInTheDocument();
  });

  it("avisa quando nem a qualidade mínima cabe no limite", async () => {
    processImage.mockResolvedValue(
      result(150_000, "image/jpeg", { quality: 0.3, fitsMaxBytes: false }),
    );
    render(<ImageCompressor />);
    fireEvent.click(screen.getByRole("radio", { name: "Tamanho máximo" }));

    chooseFile("jpg", 2000);

    expect(await screen.findByText("Não coube em 100 KB")).toBeInTheDocument();
    expect(
      screen.queryByText("Essa imagem já está bem otimizada"),
    ).not.toBeInTheDocument();
  });

  it("avisa quando o resultado não fica menor que o original", async () => {
    processImage.mockResolvedValue(result(5000));
    render(<ImageCompressor />);

    chooseFile("jpg", 1000);

    expect(
      await screen.findByText("Essa imagem já está bem otimizada"),
    ).toBeInTheDocument();
  });

  it("não avisa quando o resultado fica menor", async () => {
    processImage.mockResolvedValue(result(300));
    render(<ImageCompressor />);

    chooseFile("jpg", 1000);
    await screen.findByRole("link", { name: "Baixar imagem em JPG" });

    expect(
      screen.queryByText("Essa imagem já está bem otimizada"),
    ).not.toBeInTheDocument();
  });

  it("otimiza o PNG sem perdas, sem controle de qualidade, e sugere o WebP", async () => {
    processImage.mockResolvedValue(result(300, "image/png"));
    render(<ImageCompressor />);

    chooseFile("png");

    expect(
      await screen.findByRole("link", { name: "Baixar imagem em PNG" }),
    ).toHaveAttribute("download", "logo-compactada.png");
    expect(processImage).toHaveBeenCalledWith(expect.any(File), {
      type: "image/png",
      optimizePng: true,
    });
    expect(screen.getByText("PNG otimizado sem perdas")).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Abrir PNG para WebP" }),
    ).toHaveAttribute("href", "/png-para-webp");
  });

  it("usa o codificador WASM para WebP quando o canvas não gera WebP (Safari)", async () => {
    canEncode.mockResolvedValue(false);
    processImage.mockResolvedValue(result(300, "image/webp"));
    render(<ImageCompressor />);

    const header = bytesOf(
      "RIFF",
      [0, 0, 0, 0],
      "WEBPVP8X",
      [10, 0, 0, 0, 0, 0, 0, 0],
      [0x8f, 0x01, 0x00, 0x2b, 0x01, 0x00],
    );
    const file = new File([header, new Uint8Array(1000)], "foto.webp");
    fireEvent.change(screen.getByTestId("image-input"), {
      target: { files: [file] },
    });

    expect(
      await screen.findByRole("link", { name: "Baixar imagem em WebP" }),
    ).toHaveAttribute("download", "foto-compactada.webp");
    expect(processImage).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ type: "image/webp", encoder: "wasm" }),
    );
  });
});
