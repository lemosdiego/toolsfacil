import { describe, expect, it } from "vitest";

import { setPendingFile, takePendingFile } from "./pending-file";

describe("pending-file", () => {
  it("entrega o arquivo uma vez só", () => {
    const file = new File(["a"], "foto.png");
    setPendingFile(file);

    expect(takePendingFile()).toBe(file);
    expect(takePendingFile()).toBeUndefined();
  });

  it("um arquivo novo substitui o anterior", () => {
    const first = new File(["a"], "primeira.png");
    const second = new File(["b"], "segunda.png");
    setPendingFile(first);
    setPendingFile(second);

    expect(takePendingFile()).toBe(second);
  });

  it("sem arquivo guardado, não entrega nada", () => {
    expect(takePendingFile()).toBeUndefined();
  });
});
