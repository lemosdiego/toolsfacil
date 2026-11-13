import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pngHeader } from "@/lib/image/test-bytes";

const processImage = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/process-image", () => ({
  processImage,
  disposeImageWorker: vi.fn(),
}));

const canEncode = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/can-encode", () => ({ canEncode }));

const { WebpConverter } = await import("./webp-converter");

function chooseFile(size = 1000) {
  const file = new File(
    [pngHeader(400, 300), new Uint8Array(size - 33)],
    "foto.png",
  );
  fireEvent.change(screen.getByTestId("image-input"), {
    target: { files: [file] },
  });
}

function webpResult(size: number) {
  return {
    blob: new Blob([new Uint8Array(size)], { type: "image/webp" }),
    width: 400,
    height: 300,
  };
}

beforeEach(() => {
  canEncode.mockResolvedValue(true);
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:webp"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  processImage.mockReset();
});

describe("WebpConverter", () => {
  it("converte para WebP com qualidade 80 e baixa foto.webp", async () => {
    processImage.mockResolvedValue(webpResult(300));
    render(<WebpConverter />);

    chooseFile();

    expect(
      await screen.findByRole("link", { name: "Baixar imagem em WebP" }),
    ).toHaveAttribute("download", "foto.webp");
    expect(processImage).toHaveBeenCalledWith(expect.any(File), {
      type: "image/webp",
      quality: 0.8,
      encoder: "canvas",
    });
  });

  it("usa o codificador WASM quando o canvas não gera WebP (Safari)", async () => {
    canEncode.mockResolvedValue(false);
    processImage.mockResolvedValue(webpResult(300));
    render(<WebpConverter />);

    chooseFile();
    await screen.findByRole("link", { name: "Baixar imagem em WebP" });

    expect(canEncode).toHaveBeenCalledWith("image/webp");
    expect(processImage).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ encoder: "wasm" }),
    );
  });

  it("tem o controle de qualidade com nome e valor", () => {
    render(<WebpConverter />);

    const slider = screen.getByRole("slider", { name: "Qualidade" });
    expect(slider).toHaveValue("80");
    expect(slider).toHaveAttribute("min", "50");
    expect(slider).toHaveAttribute("max", "100");
  });

  it("converte de novo quando a pessoa para de mexer na qualidade", async () => {
    processImage.mockResolvedValue(webpResult(300));
    render(<WebpConverter />);
    chooseFile();
    await screen.findByRole("link", { name: "Baixar imagem em WebP" });

    vi.useFakeTimers();
    const slider = screen.getByRole("slider", { name: "Qualidade" });
    fireEvent.change(slider, { target: { value: "70" } });
    fireEvent.change(slider, { target: { value: "60" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(processImage).toHaveBeenCalledTimes(2);
    expect(processImage).toHaveBeenLastCalledWith(expect.any(File), {
      type: "image/webp",
      quality: 0.6,
      encoder: "canvas",
    });
  });

  it("avisa quando o WebP sai maior que o original", async () => {
    processImage.mockResolvedValue(webpResult(5000));
    render(<WebpConverter />);

    chooseFile(1000);

    expect(
      await screen.findByText("O WebP ficou maior que o original"),
    ).toBeInTheDocument();
  });

  it("não avisa quando o WebP sai menor", async () => {
    processImage.mockResolvedValue(webpResult(300));
    render(<WebpConverter />);

    chooseFile(1000);
    await screen.findByRole("link", { name: "Baixar imagem em WebP" });

    expect(
      screen.queryByText("O WebP ficou maior que o original"),
    ).not.toBeInTheDocument();
  });
});
