import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EncodedImage } from "@/lib/image/encode-image";
import { getOutputFileName } from "@/lib/image/output-file-name";
import { ftypHeader, pngHeader } from "@/lib/image/test-bytes";

import { ImageToolView } from "./image-tool-view";
import { useImageTool, type ImageToolOptions } from "./use-image-tool";

const accepts = ["image/png", "image/jpeg"] as const;

function pngFile(name = "foto.png", width = 800, height = 600) {
  return new File([pngHeader(width, height), new Uint8Array(500)], name);
}

function encoded(size = 120): EncodedImage {
  return {
    blob: new Blob([new Uint8Array(size)], { type: "image/png" }),
    width: 800,
    height: 600,
    sourceWidth: 800,
    sourceHeight: 600,
  };
}

function options(overrides: Partial<ImageToolOptions> = {}): ImageToolOptions {
  return {
    accepts,
    process: vi.fn().mockResolvedValue(encoded()),
    getFileName: (file) => getOutputFileName(file.name, { extension: "png" }),
    ...overrides,
  };
}

function Harness(props: { options: ImageToolOptions }) {
  const tool = useImageTool(props.options);
  return (
    <ImageToolView
      tool={tool}
      accepts={accepts}
      outputLabel="PNG"
      previewAlt="Prévia da imagem"
    />
  );
}

function chooseFiles(...files: File[]) {
  fireEvent.change(screen.getByTestId("image-input"), {
    target: { files },
  });
}

let urlCount = 0;
const createObjectURL = vi.fn(() => `blob:teste-${++urlCount}`);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  urlCount = 0;
  vi.stubGlobal(
    "URL",
    Object.assign(URL, { createObjectURL, revokeObjectURL }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
});

describe("ImageToolView", () => {
  it("começa com o botão, os formatos aceitos e o aviso de privacidade", () => {
    render(<Harness options={options()} />);

    expect(
      screen.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/PNG ou JPG até 20 MB/)).toBeInTheDocument();
    expect(screen.getByText(/não sai do seu aparelho/)).toBeInTheDocument();
    expect(screen.getByTestId("image-input")).toHaveAttribute(
      "accept",
      "image/png,.png,image/jpeg,.jpg,.jpeg",
    );
  });

  it("processa a imagem escolhida e mostra prévia, download e tamanhos", async () => {
    const process = vi.fn().mockResolvedValue(encoded(120));
    render(<Harness options={options({ process })} />);

    chooseFiles(pngFile("Minha Foto.png"));

    expect(
      await screen.findByRole("img", { name: "Prévia da imagem" }),
    ).toHaveAttribute("src", "blob:teste-1");
    expect(process).toHaveBeenCalledWith(expect.any(File), "image/png");

    const download = screen.getByRole("link", {
      name: "Baixar imagem em PNG",
    });
    expect(download).toHaveAttribute("download", "Minha Foto.png");
    expect(download).toHaveAttribute("href", "blob:teste-1");
    expect(screen.getByText("120 B")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Escolher outra imagem" }),
    ).toBeInTheDocument();
  });

  it("mostra erro em português quando o arquivo não é imagem", async () => {
    const process = vi.fn();
    render(<Harness options={options({ process })} />);

    chooseFiles(new File(["texto"], "falso.png", { type: "image/png" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esse arquivo não parece ser uma imagem. Escolha um arquivo PNG ou JPG.",
    );
    expect(process).not.toHaveBeenCalled();
  });

  it("sugere a ferramenta certa para foto HEIC", async () => {
    render(<Harness options={options()} />);

    chooseFiles(new File([ftypHeader("heic", ["mif1"])], "IMG_0001.jpg"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      'Para esse formato, use a ferramenta "HEIC para JPG" (em breve).',
    );
  });

  it("mostra erro quando a imagem não abre", async () => {
    const { ImageProcessingError } = await import("@/lib/image/encode-image");
    const process = vi
      .fn()
      .mockRejectedValue(new ImageProcessingError("decode-failed"));
    render(<Harness options={options({ process })} />);

    chooseFiles(pngFile());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível abrir a imagem.",
    );
  });

  it("ao soltar vários arquivos, abre o primeiro e avisa", async () => {
    const process = vi.fn().mockResolvedValue(encoded());
    render(<Harness options={options({ process })} />);

    const files = [pngFile("a.png"), pngFile("b.png")];
    fireEvent.drop(window, {
      dataTransfer: { files, types: ["Files"] },
    });

    expect(
      await screen.findByText(/Você escolheu 2 arquivos/),
    ).toBeInTheDocument();
    await waitFor(() => expect(process).toHaveBeenCalledOnce());
    expect(process.mock.calls[0][0]).toBe(files[0]);
  });
});

describe("useImageTool", () => {
  it("ignora o resultado de uma escolha anterior", async () => {
    let finishFirst: (value: EncodedImage) => void = () => {};
    const process = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise<EncodedImage>((resolve) => (finishFirst = resolve)),
      )
      .mockResolvedValueOnce(encoded(222));
    const { result } = renderHook(() => useImageTool(options({ process })));

    await act(async () => {
      void result.current.selectFile(pngFile("primeira.png"));
    });
    await act(() => result.current.selectFile(pngFile("segunda.png")));
    await act(async () => finishFirst(encoded(111)));

    const state = result.current.state;
    expect(state.status).toBe("done");
    if (state.status !== "done") return;
    expect(state.file.name).toBe("segunda.png");
    expect(state.result.blob.size).toBe(222);
  });

  it("revoga a URL ao voltar ao estado vazio", async () => {
    const { result } = renderHook(() => useImageTool(options()));

    await act(() => result.current.selectFile(pngFile()));
    act(() => result.current.reset());

    expect(result.current.state.status).toBe("idle");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:teste-1");
  });

  it("reprocessa a mesma imagem mantendo o resultado anterior durante o processo", async () => {
    const process = vi
      .fn()
      .mockResolvedValueOnce(encoded(100))
      .mockResolvedValueOnce(encoded(50));
    const { result } = renderHook(() => useImageTool(options({ process })));

    await act(() => result.current.selectFile(pngFile()));
    await act(() => result.current.reprocess());

    expect(process).toHaveBeenCalledTimes(2);
    const state = result.current.state;
    expect(state.status === "done" && state.result.blob.size).toBe(50);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:teste-1");
  });

  it("revoga a URL ao desmontar", async () => {
    const { result, unmount } = renderHook(() => useImageTool(options()));

    await act(() => result.current.selectFile(pngFile()));
    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:teste-1");
  });
});

describe("useImageTool com imagem vinda da home", () => {
  it("abre direto a imagem guardada, uma vez só", async () => {
    const { setPendingFile, takePendingFile } =
      await import("@/lib/image/pending-file");
    const process = vi.fn().mockResolvedValue(encoded());
    const file = pngFile("da-home.png");
    setPendingFile(file);

    const { result } = renderHook(() => useImageTool(options({ process })));

    await waitFor(() => expect(result.current.state.status).toBe("done"));
    expect(process.mock.calls[0][0]).toBe(file);
    expect(takePendingFile()).toBeUndefined();
  });

  it("sem imagem guardada, começa vazio", () => {
    const { result } = renderHook(() => useImageTool(options()));

    expect(result.current.state.status).toBe("idle");
  });
});
