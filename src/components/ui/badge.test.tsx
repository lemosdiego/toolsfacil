import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("usa a variante neutra por padrão", () => {
    render(<Badge>WebP</Badge>);

    expect(screen.getByText("WebP")).toHaveClass("bg-surface-muted");
  });

  it("aplica a variante de sucesso", () => {
    render(<Badge variant="success">-62%</Badge>);

    expect(screen.getByText("-62%")).toHaveClass(
      "bg-success-soft",
      "text-success",
    );
  });
});
