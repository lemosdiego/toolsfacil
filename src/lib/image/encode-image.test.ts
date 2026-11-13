import { afterEach, describe, expect, it, vi } from "vitest";

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
});
