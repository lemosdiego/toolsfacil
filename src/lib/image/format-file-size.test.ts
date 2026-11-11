import { describe, expect, it } from "vitest";

import { formatFileSize, formatSizeChange } from "./format-file-size";

// O Intl separa número e unidade com espaço comum; normaliza por segurança.
const normalize = (text: string) => text.replace(/\s/g, " ");

describe("formatFileSize", () => {
  it.each([
    [0, "0 B"],
    [512, "512 B"],
    [1023, "1023 B"],
    [1024, "1 KB"],
    [1536, "1,5 KB"],
    [348_160, "340 KB"],
    [1_258_291, "1,2 MB"],
    [104_857_600, "100 MB"],
    [5 * 1024 ** 3, "5 GB"],
  ])("%d bytes → %s", (bytes, expected) => {
    expect(normalize(formatFileSize(bytes))).toBe(expected);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "recusa o valor inválido %d",
    (bytes) => {
      expect(() => formatFileSize(bytes)).toThrow(RangeError);
    },
  );
});

describe("formatSizeChange", () => {
  it.each([
    [1000, 280, "-72%"],
    [1000, 1050, "+5%"],
    [1000, 1000, "0%"],
    [1000, 998, "0%"],
    [1000, 0, "-100%"],
  ])("%d → %d = %s", (before, after, expected) => {
    expect(formatSizeChange(before, after)).toBe(expected);
  });

  it("recusa tamanho original zero ou negativo", () => {
    expect(() => formatSizeChange(0, 10)).toThrow(RangeError);
    expect(() => formatSizeChange(100, -1)).toThrow(RangeError);
  });
});
