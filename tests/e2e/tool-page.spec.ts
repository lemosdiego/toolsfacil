import { expect, test, type Locator, type Page } from "@playwright/test";

import { findAccessibilityViolations } from "./accessibility";
import { isProductionServer } from "./server-mode";

const examplePath = "/styleguide/ferramenta";

function chooseButton(page: Page) {
  return page.getByRole("button", { name: "Escolher imagem" });
}

async function chooseSampleImage(page: Page) {
  await chooseButton(page).click();
  await expect(
    page.getByRole("img", { name: "Prévia da imagem convertida" }),
  ).toBeVisible();
}

/** Distância vertical entre o fim de `upper` e o começo de `lower`. */
async function verticalGap(upper: Locator, lower: Locator) {
  const [a, b] = await Promise.all([upper.boundingBox(), lower.boundingBox()]);
  if (!a || !b) throw new Error("elemento sem medidas");
  return b.y - (a.y + a.height);
}

test.describe("Página de ferramenta em produção", () => {
  test.skip(!isProductionServer, "só no build de produção");

  test("o exemplo responde 404", async ({ page }) => {
    const response = await page.goto(examplePath);

    expect(response?.status()).toBe(404);
  });
});

test.describe("Molde da página de ferramenta", () => {
  test.skip(isProductionServer, "o exemplo só existe em desenvolvimento");

  test("título e botão ficam acima da dobra, sem rolagem horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(examplePath);

    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport({
      ratio: 1,
    });
    await expect(chooseButton(page)).toBeInViewport({ ratio: 1 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);

    await chooseSampleImage(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
  });

  test("no celular, a prévia só aparece depois de escolher a imagem", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "comportamento do celular");
    await page.goto(examplePath);

    await expect(page.getByText("A prévia aparece aqui")).toBeHidden();
    await chooseSampleImage(page);

    const button = await chooseButton(page).boundingBox();
    const preview = await page
      .getByRole("img", { name: "Prévia da imagem convertida" })
      .boundingBox();
    expect(preview?.y ?? 0).toBeGreaterThan(button?.y ?? 0);
  });

  test("no desktop, texto e prévia ficam lado a lado", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "comportamento do desktop");
    await page.goto(examplePath);

    await expect(page.getByText("A prévia aparece aqui")).toBeVisible();
    const title = await page.getByRole("heading", { level: 1 }).boundingBox();
    const preview = await page.locator("figure").boundingBox();
    if (!title || !preview) throw new Error("sem medidas");

    expect(preview.x).toBeGreaterThan(title.x + title.width);
  });

  test("o download fica desativado até haver imagem", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(examplePath);

    await expect(
      page.getByRole("button", { name: "Baixar imagem" }),
    ).toBeDisabled();

    await chooseSampleImage(page);
    const download = page.getByRole("link", { name: "Baixar imagem em WebP" });
    await expect(download).toBeVisible();
    await expect(download).toHaveAttribute("download", "exemplo.svg");
    await expect(page.getByText("-72%")).toBeVisible();
  });

  test("o primeiro anúncio fica a pelo menos 48px da ferramenta", async ({
    page,
  }) => {
    await page.goto(examplePath);
    await chooseSampleImage(page);

    const firstAd = page.locator("[data-ad-position='below-tool']");
    const toolParts = [
      chooseButton(page),
      page.locator("figure"),
      page.getByRole("link", { name: "Baixar imagem em WebP" }),
    ];
    for (const part of toolParts) {
      expect(await verticalGap(part, firstAd)).toBeGreaterThanOrEqual(48);
    }
  });

  test("a lateral de anúncio só aparece a partir de 1024px", async ({
    page,
  }) => {
    const sidebar = page.locator("[data-ad-position='sidebar']");

    await page.setViewportSize({ width: 1023, height: 800 });
    await page.goto(examplePath);
    await expect(sidebar).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(sidebar).toBeVisible();
  });

  test("o anúncio do topo só aparece no desktop, a 48px da ferramenta", async ({
    page,
  }) => {
    const topAd = page.locator("[data-ad-position='top']");

    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(examplePath);
    await expect(topAd).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(topAd).toBeVisible();
    await chooseSampleImage(page);
    for (const part of [
      page.getByRole("heading", { level: 1 }),
      page.locator("figure"),
      page.getByRole("link", { name: "Baixar imagem em WebP" }),
    ]) {
      expect(await verticalGap(topAd, part)).toBeGreaterThanOrEqual(48);
    }
    // Mesmo com o anúncio, o botão continua sem precisar rolar.
    await expect(chooseButton(page)).toBeInViewport({ ratio: 1 });
  });

  test("tem as quatro posições de anúncio e o texto explicativo", async ({
    page,
  }) => {
    await page.goto(examplePath);

    for (const position of ["top", "below-tool", "in-content", "sidebar"]) {
      await expect(
        page.locator(`[data-ad-position='${position}']`),
      ).toHaveCount(1);
    }
    for (const title of ["Como usar", "Perguntas frequentes", "Privacidade"]) {
      await expect(
        page.getByRole("heading", { level: 2, name: title }),
      ).toBeVisible();
    }
  });

  for (const colorScheme of ["light", "dark"] as const) {
    for (const state of ["vazio", "com imagem"] as const) {
      test(`sem violações de acessibilidade (tema ${colorScheme}, prévia ${state})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(examplePath);
        if (state === "com imagem") await chooseSampleImage(page);

        expect(await findAccessibilityViolations(page)).toEqual([]);
      });
    }
  }
});
