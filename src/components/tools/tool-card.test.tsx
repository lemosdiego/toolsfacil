import { render, screen } from "@testing-library/react";
import { FileImage } from "lucide-react";
import { describe, expect, it } from "vitest";

import type { Tool } from "@/lib/tools";

import { ToolCard } from "./tool-card";

const tool: Tool = {
  slug: "converter-webp",
  name: "Converter para WebP",
  shortDescription: "PNG e JPG para WebP.",
  icon: FileImage,
  category: "convert",
  transformation: { from: ["PNG", "JPG"], to: ["WebP"] },
  status: "available",
};

describe("ToolCard", () => {
  it("vira link para a rota da ferramenta quando disponível", () => {
    render(<ToolCard tool={tool} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/converter-webp");
    expect(link).toHaveAttribute("id", "converter-webp");
    expect(screen.queryByText("Em breve")).not.toBeInTheDocument();
  });

  it("mostra Em breve e não é link quando ainda não existe", () => {
    render(<ToolCard tool={{ ...tool, status: "soon" }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("id", "converter-webp");
    expect(screen.getByText("Em breve")).toBeInTheDocument();
  });

  it("mostra a transformação com texto para leitores de tela", () => {
    render(<ToolCard tool={tool} />);

    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText("JPG")).toBeInTheDocument();
    expect(screen.getByText("WebP")).toBeInTheDocument();
    expect(screen.getByText("para")).toHaveClass("sr-only");
  });

  it("usa o nome como título h3", () => {
    render(<ToolCard tool={tool} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Converter para WebP" }),
    ).toBeInTheDocument();
  });
});
