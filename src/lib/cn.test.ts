import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("junta classes e ignora valores falsos", () => {
    expect(cn("a", false, null, undefined, "b", { c: true, d: false })).toBe(
      "a b c",
    );
  });

  it("resolve conflitos do Tailwind mantendo a última classe", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("resolve conflitos entre tokens semânticos de cor", () => {
    expect(cn("bg-surface text-muted", "bg-primary")).toBe(
      "text-muted bg-primary",
    );
  });

  it("não confunde cor de texto com tamanho de texto", () => {
    expect(cn("text-sm text-muted", "text-foreground")).toBe(
      "text-sm text-foreground",
    );
  });

  it("resolve conflitos entre raios personalizados", () => {
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card");
  });

  it("resolve conflitos entre sombras e larguras personalizadas", () => {
    expect(cn("max-w-content shadow-card", "max-w-prose shadow-raised")).toBe(
      "max-w-prose shadow-raised",
    );
  });
});
