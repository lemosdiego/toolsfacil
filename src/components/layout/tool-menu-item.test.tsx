import { render, screen } from "@testing-library/react";
import { FileImage } from "lucide-react";
import { describe, expect, it } from "vitest";

import type { Tool } from "@/lib/tools";

import { ToolMenuItem } from "./tool-menu-item";

const baseTool: Tool = {
  slug: "converter-webp",
  name: "Converter para WebP",
  shortDescription: "PNG e JPG para WebP.",
  icon: FileImage,
  category: "convert",
  transformation: { from: ["PNG"], to: ["WebP"] },
  status: "available",
};

describe("ToolMenuItem", () => {
  it("vira link quando a ferramenta está disponível", () => {
    render(<ToolMenuItem tool={baseTool} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/converter-webp");
    expect(screen.queryByText("Em breve")).not.toBeInTheDocument();
  });

  it("mostra Em breve e não é link quando ainda não existe", () => {
    render(<ToolMenuItem tool={{ ...baseTool, status: "soon" }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });
});
