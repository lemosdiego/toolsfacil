import { afterEach, describe, expect, it, vi } from "vitest";

const encodeImage = vi.hoisted(() => vi.fn());

vi.mock("./encode-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./encode-image")>()),
  encodeImage,
}));

const { processImage } = await import("./process-image");

afterEach(() => {
  vi.unstubAllGlobals();
  encodeImage.mockReset();
});

describe("processImage", () => {
  it("usa a thread principal quando não há OffscreenCanvas", async () => {
    vi.stubGlobal("OffscreenCanvas", undefined);
    const result = { blob: new Blob(), width: 1, height: 1 };
    encodeImage.mockResolvedValue(result);
    const file = new Blob(["a"]);

    await expect(processImage(file, { type: "image/png" })).resolves.toBe(
      result,
    );
    expect(encodeImage).toHaveBeenCalledWith(file, { type: "image/png" });
  });
});
