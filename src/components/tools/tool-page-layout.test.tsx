import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ToolActionArea,
  ToolPageLayout,
  ToolPageSection,
  ToolPreviewArea,
} from "./tool-page-layout";

beforeEach(() => {
  // Em dev, o AdSlot aparece com o contorno: dá para ver as posições.
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function renderLayout(sectionCount = 3, hiddenOnMobile = false) {
  const titles = ["Como usar", "Perguntas frequentes", "Privacidade"];

  return render(
    <ToolPageLayout
      title="PNG para WebP"
      description="Converta PNG em WebP no navegador."
      tool={
        <>
          <ToolActionArea>
            <button type="button">Escolher imagem</button>
          </ToolActionArea>
          <ToolPreviewArea hiddenOnMobile={hiddenOnMobile}>
            <div data-testid="preview">prévia</div>
          </ToolPreviewArea>
        </>
      }
    >
      {titles.slice(0, sectionCount).map((title) => (
        <ToolPageSection key={title} title={title}>
          <p>Texto de {title}.</p>
        </ToolPageSection>
      ))}
    </ToolPageLayout>,
  );
}

const adPositions = () =>
  screen
    .getAllByRole("complementary", { name: "Publicidade" })
    .map((slot) => slot.getAttribute("data-ad-position"));

describe("ToolPageLayout", () => {
  it("tem um único h1, a descrição, a ferramenta e as seções h2", () => {
    renderLayout();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "PNG para WebP" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Converta PNG em WebP no navegador."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("preview")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  it("não cria outro main (o layout raiz já tem um)", () => {
    renderLayout();

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("coloca os quatro anúncios, com o in-content depois da primeira seção", () => {
    renderLayout();

    expect(adPositions()).toEqual([
      "top",
      "below-tool",
      "in-content",
      "sidebar",
    ]);

    const firstSection = screen.getByRole("heading", { name: "Como usar" });
    const inContent = screen
      .getAllByRole("complementary", { name: "Publicidade" })
      .find((slot) => slot.dataset.adPosition === "in-content");
    expect(
      firstSection.compareDocumentPosition(inContent as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("sem segunda seção, não coloca o anúncio in-content", () => {
    renderLayout(1);

    expect(adPositions()).toEqual(["top", "below-tool", "sidebar"]);
  });

  it("a prévia pode ficar escondida no celular", () => {
    renderLayout(3, true);

    expect(screen.getByTestId("preview").parentElement).toHaveClass(
      "hidden",
      "lg:block",
    );
  });
});
