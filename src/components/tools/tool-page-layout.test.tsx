import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToolPageLayout, ToolPageSection } from "./tool-page-layout";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderLayout() {
  return render(
    <ToolPageLayout
      title="Converter imagem para WebP"
      description="PNG e JPG para WebP, direto no navegador."
      tool={<button type="button">Escolher imagem</button>}
    >
      <ToolPageSection title="Como usar">
        <p>Passo a passo.</p>
      </ToolPageSection>
    </ToolPageLayout>,
  );
}

describe("ToolPageLayout", () => {
  it("tem um único h1 com o título da ferramenta", () => {
    renderLayout();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Converter imagem para WebP");
  });

  it("coloca a ferramenta antes de qualquer anúncio", () => {
    renderLayout();

    const toolArea = screen.getByRole("region", { name: "Ferramenta" });
    const ads = screen.getAllByRole("complementary", { name: "Publicidade" });

    expect(ads.length).toBeGreaterThan(0);
    for (const ad of ads) {
      expect(
        toolArea.compareDocumentPosition(ad) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("separa o anúncio da ferramenta com divisória e margem", () => {
    renderLayout();

    const belowTool = screen
      .getAllByRole("complementary", { name: "Publicidade" })
      .find((ad) => ad.dataset.adPosition === "below-tool");
    expect(belowTool?.parentElement).toHaveClass("border-t", "pt-8");
  });

  it("renderiza as seções de texto com h2", () => {
    renderLayout();

    expect(
      screen.getByRole("heading", { level: 2, name: "Como usar" }),
    ).toBeInTheDocument();
  });
});
