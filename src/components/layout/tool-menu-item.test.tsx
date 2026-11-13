import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Tool } from "@/lib/tools";

import { ToolMenuItem } from "./tool-menu-item";

const baseTool: Tool = {
  slug: "png-para-webp",
  name: "PNG para WebP",
  shortDescription: "PNG para WebP.",
  category: "convert",
  status: "available",
  accepts: ["image/png"],
};

describe("ToolMenuItem", () => {
  it("vira link quando a ferramenta está disponível", () => {
    render(<ToolMenuItem tool={baseTool} />);

    expect(screen.getByRole("link", { name: "PNG para WebP" })).toHaveAttribute(
      "href",
      "/png-para-webp",
    );
    expect(screen.queryByText("Em breve")).not.toBeInTheDocument();
  });

  it("mostra Em breve e não é link quando ainda não existe", () => {
    render(<ToolMenuItem tool={{ ...baseTool, status: "soon" }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });
});
