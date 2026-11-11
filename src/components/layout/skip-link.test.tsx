import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MAIN_CONTENT_ID, SkipLink } from "./skip-link";

describe("SkipLink", () => {
  it("aponta para o conteúdo principal", () => {
    render(<SkipLink />);

    expect(
      screen.getByRole("link", { name: "Pular para o conteúdo" }),
    ).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);
  });
});
