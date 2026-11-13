import { describe, expect, it } from "vitest";

import { formatTypeList, getAcceptAttribute } from "./image-formats";

describe("getAcceptAttribute", () => {
  it("junta os tipos MIME e as extensões", () => {
    expect(getAcceptAttribute(["image/png", "image/jpeg"])).toBe(
      "image/png,.png,image/jpeg,.jpg,.jpeg",
    );
  });
});

describe("formatTypeList", () => {
  it("escreve a lista em português", () => {
    expect(formatTypeList(["image/png"])).toBe("PNG");
    expect(formatTypeList(["image/png", "image/jpeg"])).toBe("PNG ou JPG");
    expect(formatTypeList(["image/jpeg", "image/png", "image/webp"])).toBe(
      "JPG, PNG ou WebP",
    );
  });
});
