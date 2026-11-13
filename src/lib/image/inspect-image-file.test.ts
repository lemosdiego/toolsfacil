import { describe, expect, it } from "vitest";

import { inspectImageFile } from "./inspect-image-file";
import { pngHeader } from "./test-bytes";

describe("inspectImageFile", () => {
  it("lê tipo e dimensões do começo do arquivo", async () => {
    const file = new File([pngHeader(640, 480), new Uint8Array(100)], "a.png");

    expect(await inspectImageFile(file)).toEqual({
      size: file.size,
      type: "image/png",
      dimensions: { width: 640, height: 480 },
    });
  });

  it("ignora a extensão e o tipo informado pelo navegador", async () => {
    const file = new File(["texto qualquer"], "falso.png", {
      type: "image/png",
    });

    expect(await inspectImageFile(file)).toMatchObject({
      type: undefined,
      dimensions: undefined,
    });
  });
});
