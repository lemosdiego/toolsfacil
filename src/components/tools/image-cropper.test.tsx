import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Rect } from "@/lib/image/crop-geometry";
import { pngHeader } from "@/lib/image/test-bytes";

const processImage = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/process-image", () => ({
  processImage,
  disposeImageWorker: vi.fn(),
}));

const canEncode = vi.hoisted(() => vi.fn());
vi.mock("@/lib/image/can-encode", () => ({ canEncode }));

/*
 * O Cropper.js não roda no jsdom: o editor simulado mostra a proporção e
 * deixa o teste "arrastar" a seleção. O editor real é testado no Playwright.
 */
const cropEditorProps = vi.hoisted(() => ({
  current: undefined as
    { ratio?: number; onCropChange: (crop: Rect) => void } | undefined,
}));
vi.mock("./crop-editor", () => ({
  CropEditor: (props: {
    ratio?: number;
    onCropChange: (crop: Rect) => void;
  }) => {
    cropEditorProps.current = props;
    return (
      <div data-testid="crop-editor">proporção {props.ratio ?? "livre"}</div>
    );
  },
}));

const { ImageCropper } = await import("./image-cropper");

function chooseFile(name = "foto.png") {
  const file = new File([pngHeader(400, 300), new Uint8Array(500)], name);
  fireEvent.change(screen.getByTestId("image-input"), {
    target: { files: [file] },
  });
}

function encoded(width: number, height: number, type = "image/png") {
  return {
    blob: new Blob([new Uint8Array(100)], { type }),
    width,
    height,
    sourceWidth: 400,
    sourceHeight: 300,
  };
}

/** Escolhe a imagem e espera o editor, com o corte inicial informado. */
async function openEditor(
  crop: Rect = { x: 0, y: 0, width: 400, height: 300 },
) {
  chooseFile();
  await screen.findByTestId("crop-editor");
  act(() => cropEditorProps.current?.onCropChange(crop));
}

beforeEach(() => {
  canEncode.mockResolvedValue(true);
  // Primeira chamada: prévia do editor; depois, o resultado.
  processImage.mockResolvedValue(encoded(400, 300));
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:imagem"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  processImage.mockReset();
  cropEditorProps.current = undefined;
});

describe("ImageCropper", () => {
  it("abre o editor sem processar o corte, só a prévia reduzida", async () => {
    render(<ImageCropper />);

    await openEditor();

    expect(processImage).toHaveBeenCalledOnce();
    expect(processImage).toHaveBeenCalledWith(expect.any(File), {
      type: "image/png",
      quality: 0.85,
      rotate: 0,
      fit: 1600,
    });
    expect(screen.getByText("Corte: 400 × 300 px.")).toBeInTheDocument();
  });

  it("proporções como rádios, com o uso no nome", async () => {
    render(<ImageCropper />);
    await openEditor();

    expect(screen.getByRole("radio", { name: /^Livre/ })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: /^1:1/ }));

    expect(screen.getByTestId("crop-editor")).toHaveTextContent("proporção 1");
  });

  it("corta no mesmo formato e baixa foto-cortada.png", async () => {
    render(<ImageCropper />);
    await openEditor({ x: 10, y: 20, width: 200, height: 100 });
    processImage.mockResolvedValue(encoded(200, 100));

    fireEvent.click(screen.getByRole("button", { name: "Cortar imagem" }));

    expect(
      await screen.findByRole("link", { name: "Baixar imagem em PNG" }),
    ).toHaveAttribute("download", "foto-cortada.png");
    expect(processImage).toHaveBeenLastCalledWith(expect.any(File), {
      type: "image/png",
      quality: undefined,
      encoder: "canvas",
      rotate: 0,
      crop: { x: 10, y: 20, width: 200, height: 100 },
      resize: undefined,
    });
    expect(screen.getByText("200 × 100 px")).toBeInTheDocument();
  });

  it("com a proporção travada, a altura acompanha a largura", async () => {
    render(<ImageCropper />);
    await openEditor({ x: 0, y: 0, width: 400, height: 300 });

    expect(
      screen.getByRole("button", { name: "Manter a proporção" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("textbox", { name: "Largura" }), {
      target: { value: "200" },
    });

    expect(screen.getByRole("textbox", { name: "Altura" })).toHaveValue("150");
  });

  it("destravada, cada lado muda sozinho e o corte vai com esse tamanho", async () => {
    render(<ImageCropper />);
    await openEditor();

    fireEvent.click(screen.getByRole("button", { name: "Manter a proporção" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Largura" }), {
      target: { value: "120" },
    });
    expect(screen.getByRole("textbox", { name: "Altura" })).toHaveValue("300");

    fireEvent.click(screen.getByRole("button", { name: "Cortar imagem" }));
    await screen.findByRole("link", { name: "Baixar imagem em PNG" });

    expect(processImage).toHaveBeenLastCalledWith(
      expect.any(File),
      expect.objectContaining({ resize: { width: 120, height: 300 } }),
    );
  });

  it("avisa ao aumentar além do corte", async () => {
    render(<ImageCropper />);
    await openEditor();

    fireEvent.change(screen.getByRole("textbox", { name: "Largura" }), {
      target: { value: "800" },
    });

    expect(
      screen.getByText("A imagem vai ficar maior que o corte"),
    ).toBeInTheDocument();
  });

  it("tamanho inválido desativa o corte e explica o motivo", async () => {
    render(<ImageCropper />);
    await openEditor();

    fireEvent.change(screen.getByRole("textbox", { name: "Largura" }), {
      target: { value: "abc" },
    });

    expect(screen.getByRole("textbox", { name: "Largura" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByText("Use números inteiros maiores que zero."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cortar imagem" }),
    ).toBeDisabled();
  });

  it("girar gera uma prévia nova, girada", async () => {
    render(<ImageCropper />);
    await openEditor();

    fireEvent.click(screen.getByRole("button", { name: "Girar 90°" }));
    await screen.findByTestId("crop-editor");

    expect(processImage).toHaveBeenLastCalledWith(
      expect.any(File),
      expect.objectContaining({ rotate: 90, fit: 1600 }),
    );
  });

  it("voltar a editar reabre o editor", async () => {
    render(<ImageCropper />);
    await openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Cortar imagem" }));
    await screen.findByRole("link", { name: "Baixar imagem em PNG" });

    fireEvent.click(screen.getByRole("button", { name: "Voltar a editar" }));

    expect(await screen.findByTestId("crop-editor")).toBeInTheDocument();
  });
});
