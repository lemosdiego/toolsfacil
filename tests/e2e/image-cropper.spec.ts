import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  expect,
  test,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test";

import { detectImageType } from "@/lib/image/detect-image-type";
import { readImageDimensions } from "@/lib/image/read-image-dimensions";

import { findAccessibilityViolations } from "./accessibility";

/*
 * Cortar e redimensionar imagem (fase 12), de ponta a ponta, em dev e no
 * build de produção.
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

const path = "/cortador-de-imagem";
const h1 = "Cortar e redimensionar imagem";

function fixture(name: string) {
  return join(__dirname, "..", "fixtures", name);
}

const input = (page: Page) => page.getByTestId("image-input");
const editor = (page: Page) => page.getByTestId("crop-editor");
const cropButton = (page: Page) =>
  page.getByRole("button", { name: "Cortar imagem" });
const downloadLink = (page: Page, label: "JPG" | "PNG" | "WebP") =>
  page.getByRole("link", { name: `Baixar imagem em ${label}` });

/** Abre a página e espera a hidratação (antes dela, o seletor não reage). */
async function open(page: Page, target = path) {
  await page.goto(target);
  await page.waitForLoadState("networkidle");
}

/** Escolhe a imagem e espera o editor ficar pronto (com o corte medido). */
async function chooseAndWaitEditor(page: Page, name: string) {
  await input(page).setInputFiles(fixture(name));
  await expect(editor(page)).toBeVisible();
  await expect(editor(page)).not.toHaveAttribute("aria-busy", "true");
  await expect(page.getByText(/^Corte: \d+ × \d+ px\.$/)).toBeVisible();
}

async function choosePreset(page: Page, label: string) {
  await page
    .getByRole("group", { name: "Proporção" })
    .locator("label")
    .filter({ hasText: label })
    .click();
}

async function downloadResult(link: Locator) {
  const [download] = await Promise.all([
    link.page().waitForEvent("download"),
    link.click(),
  ]);
  return {
    fileName: download.suggestedFilename(),
    bytes: new Uint8Array(await readFile(await download.path())),
  };
}

test.describe("Página Cortar e redimensionar imagem", () => {
  test("tem h1, metadados, canonical e JSON-LD", async ({ page }) => {
    await open(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expect(page).toHaveTitle(
      "Cortar e redimensionar imagem online, grátis | Tools Fácil",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${siteUrl}${path}`,
    );
    const jsonLd = JSON.parse(
      (await page
        .locator('script[type="application/ld+json"]')
        .textContent()) ?? "[]",
    );
    const app = jsonLd.find(
      (item: { "@type": string }) => item["@type"] === "WebApplication",
    );
    const faqPage = jsonLd.find(
      (item: { "@type": string }) => item["@type"] === "FAQPage",
    );
    expect(app).toMatchObject({ name: h1, url: `${siteUrl}${path}` });
    await expect(page.locator("details")).toHaveCount(
      faqPage.mainEntity.length,
    );
  });

  test("no celular, h1 e botão acima da dobra, sem rolagem horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page);

    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport({
      ratio: 1,
    });
    await expect(
      page.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInViewport({ ratio: 1 });

    await chooseAndWaitEditor(page, "foto.jpg");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`sem violações de acessibilidade no tema ${colorScheme}: vazio, editando e com resultado`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await open(page);
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await chooseAndWaitEditor(page, "foto.jpg");
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await cropButton(page).click();
      await expect(downloadLink(page, "JPG")).toBeVisible();
      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});

test.describe("Corte e redimensionamento", () => {
  test("o Cropper.js só carrega depois de escolher a imagem", async ({
    page,
  }) => {
    const cropperRequests: string[] = [];
    page.on("request", (request) => {
      if (/cropper/i.test(request.url())) cropperRequests.push(request.url());
    });
    await open(page);
    expect(await page.locator("cropper-canvas").count()).toBe(0);

    await chooseAndWaitEditor(page, "foto.jpg");

    await expect(page.locator("cropper-canvas")).toHaveCount(1);
  });

  test("1:1 numa foto 480 × 320 sai JPG de 320 × 320", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto.jpg");

    await choosePreset(page, "1:1");
    await expect(page.getByText("Corte: 320 × 320 px.")).toBeVisible();
    await cropButton(page).click();

    const { fileName, bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(fileName).toBe("foto-cortada.jpg");
    expect(detectImageType(bytes)).toBe("image/jpeg");
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 320,
      height: 320,
    });
  });

  test("o tamanho final redimensiona o corte", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto.jpg");
    await choosePreset(page, "1:1");

    await page.getByRole("textbox", { name: "Largura" }).fill("100");
    await expect(page.getByRole("textbox", { name: "Altura" })).toHaveValue(
      "100",
    );
    await cropButton(page).click();

    const { bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 100,
      height: 100,
    });
  });

  test("girar 90° troca largura e altura", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto.jpg");

    await page.getByRole("button", { name: "Girar 90°" }).click();
    await expect(page.getByText("Corte: 320 × 480 px.")).toBeVisible();
    await cropButton(page).click();

    const { bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 320,
      height: 480,
    });
  });

  test("o PNG sai PNG, com a transparência", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "transparente.png");
    await cropButton(page).click();

    const link = downloadLink(page, "PNG");
    const href = await link.getAttribute("href");
    const alpha = await page.evaluate(async (url) => {
      const bitmap = await createImageBitmap(await (await fetch(url!)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      return [
        context.getImageData(5, 5, 1, 1).data[3],
        context.getImageData(160, 120, 1, 1).data[3],
      ];
    }, href);
    expect(alpha).toEqual([0, 255]);
    const { fileName, bytes } = await downloadResult(link);
    expect(fileName).toBe("transparente-cortada.png");
    expect(detectImageType(bytes)).toBe("image/png");
  });

  test("o WebP continua WebP", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "imagem.webp");
    await cropButton(page).click();

    const { fileName, bytes } = await downloadResult(
      downloadLink(page, "WebP"),
    );
    expect(fileName).toBe("imagem-cortada.webp");
    expect(detectImageType(bytes)).toBe("image/webp");
  });

  test("foto com EXIF de orientação 6 é cortada de pé", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto-retrato-exif-6.jpg");

    await expect(page.getByText("Corte: 300 × 400 px.")).toBeVisible();
    await choosePreset(page, "1:1");
    await cropButton(page).click();

    const { bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 300,
      height: 300,
    });
  });

  test("o teclado move e redimensiona a seleção", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto.jpg");
    await choosePreset(page, "1:1");
    await expect(page.getByText("Corte: 320 × 320 px.")).toBeVisible();

    await editor(page).focus();
    // Encolhe pela borda direita (com a proporção, a altura acompanha).
    for (let index = 0; index < 5; index++) {
      await page.keyboard.press("Shift+ArrowLeft");
    }
    const shrunk = page.getByText(/^Corte: (\d+) × \1 px\.$/);
    await expect(shrunk).toBeVisible();
    await expect(page.getByText("Corte: 320 × 320 px.")).toHaveCount(0);

    await page.keyboard.press("ArrowRight");
    await expect(shrunk).toBeVisible();
  });

  test("voltar a editar reabre o editor", async ({ page }) => {
    await open(page);
    await chooseAndWaitEditor(page, "foto.jpg");
    await cropButton(page).click();
    await expect(downloadLink(page, "JPG")).toBeVisible();

    await page.getByRole("button", { name: "Voltar a editar" }).click();

    await expect(editor(page)).toBeVisible();
    await expect(cropButton(page)).toBeVisible();
  });

  test("nenhuma requisição de rede leva o arquivo", async ({ page }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));
    await open(page);

    await chooseAndWaitEditor(page, "transparente.png");
    await cropButton(page).click();
    await downloadResult(downloadLink(page, "PNG"));

    for (const request of requests) {
      expect(request.postDataBuffer(), request.url()).toBeNull();
      expect(request.url()).not.toContain("transparente");
      expect(["GET", "HEAD"]).toContain(request.method());
    }
  });
});

test.describe("Cortar imagem liberada", () => {
  test("entra no sitemap", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();

    expect(body).toContain(`<loc>${siteUrl}${path}</loc>`);
  });

  test("o menu de ferramentas leva à página", async ({ page, isMobile }) => {
    await open(page, "/");
    const button = page.getByRole("button", { name: "Ferramentas" });
    if (isMobile) await button.click();
    else await button.hover();

    const link = page.getByRole("link", { name: "Cortar imagem", exact: true });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  });

  test("a ação da home leva a imagem até o editor", async ({ page }) => {
    await open(page, "/");
    await input(page).setInputFiles(fixture("foto.jpg"));

    await page
      .getByRole("link", { name: "Cortar e redimensionar", exact: true })
      .click();

    await expect(page).toHaveURL(path);
    await expect(editor(page)).toBeVisible();
    await expect(page.getByText("Corte: 480 × 320 px.")).toBeVisible();
  });
});
