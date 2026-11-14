import { afterEach, describe, expect, it, vi } from "vitest";

const encodeWebpWithWasm = vi.hoisted(() => vi.fn());
vi.mock("./wasm-webp-encoder", () => ({ encodeWebpWithWasm }));

const optimizePngWithWasm = vi.hoisted(() => vi.fn());
vi.mock("./wasm-png-optimizer", () => ({ optimizePngWithWasm }));

import { encodeImage, ImageProcessingError } from "./encode-image";

/*
 * O jsdom não tem canvas: os testes simulam createImageBitmap e
 * OffscreenCanvas. A codificação real é testada no Playwright.
 */

function fakeBitmap(width = 40, height = 30) {
  return { width, height, close: vi.fn() };
}

function fakeOffscreenCanvas(outputType: string) {
  const context = {
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  };
  const instances: { width: number; height: number }[] = [];

  class FakeOffscreenCanvas {
    width: number;
    height: number;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      instances.push(this);
    }
    getContext() {
      return context;
    }
    convertToBlob() {
      return Promise.resolve(new Blob(["x"], { type: outputType }));
    }
  }

  vi.stubGlobal("OffscreenCanvas", FakeOffscreenCanvas);
  return { context, instances };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("encodeImage", () => {
  it("aplica a orientação do EXIF e devolve o blob com as dimensões", async () => {
    const bitmap = fakeBitmap(30, 40);
    const createImageBitmap = vi.fn().mockResolvedValue(bitmap);
    vi.stubGlobal("createImageBitmap", createImageBitmap);
    fakeOffscreenCanvas("image/png");

    const result = await encodeImage(new Blob(["a"]), { type: "image/png" });

    expect(createImageBitmap).toHaveBeenCalledWith(expect.any(Blob), {
      imageOrientation: "from-image",
    });
    expect(result).toMatchObject({ width: 30, height: 40 });
    expect(result.blob.type).toBe("image/png");
  });

  it("fecha o bitmap e zera o canvas no fim", async () => {
    const bitmap = fakeBitmap();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
    const { instances } = fakeOffscreenCanvas("image/png");

    await encodeImage(new Blob(["a"]), { type: "image/png" });

    expect(bitmap.close).toHaveBeenCalledOnce();
    expect(instances[0]).toMatchObject({ width: 0, height: 0 });
  });

  it("pinta fundo branco no JPG (sem transparência)", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    const { context } = fakeOffscreenCanvas("image/jpeg");

    await encodeImage(new Blob(["a"]), { type: "image/jpeg", quality: 0.8 });

    expect(context.fillStyle).toBe("white");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 40, 30);
  });

  it("não pinta fundo no PNG (preserva a transparência)", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    const { context } = fakeOffscreenCanvas("image/png");

    await encodeImage(new Blob(["a"]), { type: "image/png" });

    expect(context.fillRect).not.toHaveBeenCalled();
  });

  it("falha com decode-failed quando a imagem não abre", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("corrompida")),
    );
    fakeOffscreenCanvas("image/png");

    await expect(
      encodeImage(new Blob(["a"]), { type: "image/png" }),
    ).rejects.toEqual(new ImageProcessingError("decode-failed"));
  });

  it("falha com encode-failed quando o navegador devolve outro formato", async () => {
    const bitmap = fakeBitmap();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
    // Safari: pede WebP, recebe PNG.
    fakeOffscreenCanvas("image/png");

    await expect(
      encodeImage(new Blob(["a"]), { type: "image/webp" }),
    ).rejects.toEqual(new ImageProcessingError("encode-failed"));
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it("usa o codificador WASM para WebP quando pedido (Safari)", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    const { context } = fakeOffscreenCanvas("image/png");
    encodeWebpWithWasm.mockResolvedValue(
      new Blob(["w"], { type: "image/webp" }),
    );

    const result = await encodeImage(new Blob(["a"]), {
      type: "image/webp",
      quality: 0.7,
      encoder: "wasm",
    });

    expect(context.getImageData).toHaveBeenCalledWith(0, 0, 40, 30);
    expect(encodeWebpWithWasm).toHaveBeenCalledWith(expect.anything(), 0.7);
    expect(result.blob.type).toBe("image/webp");
  });

  it("falha com encode-failed quando o WASM não carrega", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    fakeOffscreenCanvas("image/png");
    encodeWebpWithWasm.mockRejectedValue(new Error("sem wasm"));

    await expect(
      encodeImage(new Blob(["a"]), { type: "image/webp", encoder: "wasm" }),
    ).rejects.toEqual(new ImageProcessingError("encode-failed"));
  });

  it("otimiza o PNG sem perdas com o oxipng quando pedido", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    const { context } = fakeOffscreenCanvas("image/png");
    optimizePngWithWasm.mockResolvedValue(
      new Blob(["p"], { type: "image/png" }),
    );

    const result = await encodeImage(new Blob(["a"]), {
      type: "image/png",
      optimizePng: true,
    });

    expect(context.getImageData).toHaveBeenCalledWith(0, 0, 40, 30);
    expect(optimizePngWithWasm).toHaveBeenCalledOnce();
    expect(result.blob.type).toBe("image/png");
  });

  it("falha com encode-failed quando o oxipng não carrega", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(fakeBitmap()));
    fakeOffscreenCanvas("image/png");
    optimizePngWithWasm.mockRejectedValue(new Error("sem wasm"));

    await expect(
      encodeImage(new Blob(["a"]), { type: "image/png", optimizePng: true }),
    ).rejects.toEqual(new ImageProcessingError("encode-failed"));
  });
});
