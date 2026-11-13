import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { expect, test, type Page, type Request } from "@playwright/test";

import { detectImageType } from "@/lib/image/detect-image-type";
import { readImageDimensions } from "@/lib/image/read-image-dimensions";

import { findAccessibilityViolations } from "./accessibility";

/*
 * Conversores PNG para WebP e JPG para WebP (fase 10), de ponta a ponta,
 * em dev e no build de produção.
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

const pages = [
  { path: "/png-para-webp", h1: "Converter PNG para WebP" },
  { path: "/jpg-para-webp", h1: "Converter JPG para WebP" },
] as const;

function fixture(name: string) {
  return join(__dirname, "..", "fixtures", name);
}

const input = (page: Page) => page.getByTestId("image-input");

/** Abre a página e espera a hidratação (antes dela, o seletor não reage). */
async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}
const errorAlert = (page: Page) => page.getByRole("main").getByRole("alert");
const downloadLink = (page: Page) =>
  page.getByRole("link", { name: "Baixar imagem em WebP" });

async function downloadResult(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadLink(page).click(),
  ]);
  return {
    fileName: download.suggestedFilename(),
    bytes: new Uint8Array(await readFile(await download.path())),
  };
}

/** Alfa de dois pontos do resultado (canto e centro), lido na própria página. */
async function alphaAt(page: Page, points: [number, number][]) {
  const href = await downloadLink(page).getAttribute("href");
  return page.evaluate(
    async ({ url, points }) => {
      const bitmap = await createImageBitmap(await (await fetch(url!)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      return points.map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
    },
    { url: href, points },
  );
}

/** Simula o Safari: o canvas da página devolve PNG quando se pede WebP. */
async function simulateCanvasWithoutWebp(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      const fallback = type === "image/webp" ? "image/png" : type;
      return original.call(this, callback, fallback, quality);
    };
  });
}

for (const { path, h1 } of pages) {
  test.describe(`Página ${path}`, () => {
    test("tem h1, metadados, canonical e JSON-LD", async ({ page }) => {
      await open(page, path);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page).toHaveTitle(`${h1} online e grátis | Tools Fácil`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /navegador/,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${siteUrl}${path}`,
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
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
      expect(app).not.toHaveProperty("aggregateRating");
      // A FAQ do JSON-LD é a mesma que aparece na página.
      await expect(page.locator("details")).toHaveCount(
        faqPage.mainEntity.length,
      );
    });

    test("no celular, h1 e botão acima da dobra, sem rolagem horizontal", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await open(page, path);

      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport({
        ratio: 1,
      });
      await expect(
        page.getByRole("button", { name: "Escolher imagem" }),
      ).toBeInViewport({ ratio: 1 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(360);
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`sem violações de acessibilidade no tema ${colorScheme}, antes e depois da conversão`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await open(page, path);
        expect(await findAccessibilityViolations(page)).toEqual([]);

        await input(page).setInputFiles(fixture("foto.jpg"));
        await expect(downloadLink(page)).toBeVisible();
        expect(await findAccessibilityViolations(page)).toEqual([]);
      });
    }
  });
}

test.describe("Conversão para WebP", () => {
  test("PNG transparente vira WebP de verdade, com as mesmas dimensões e a transparência", async ({
    page,
  }) => {
    await open(page, "/png-para-webp");
    await input(page).setInputFiles(fixture("transparente.png"));
    await expect(downloadLink(page)).toBeVisible();

    expect(
      await alphaAt(page, [
        [5, 5],
        [160, 120],
      ]),
    ).toEqual([0, 255]);
    const { fileName, bytes } = await downloadResult(page);
    expect(fileName).toBe("transparente.webp");
    expect(detectImageType(bytes)).toBe("image/webp");
    expect(readImageDimensions(bytes, "image/webp")).toEqual({
      width: 320,
      height: 240,
    });
  });

  test("foto JPG com EXIF de orientação 6 sai de pé", async ({ page }) => {
    await open(page, "/jpg-para-webp");
    await input(page).setInputFiles(fixture("foto-retrato-exif-6.jpg"));

    const { fileName, bytes } = await downloadResult(page);
    expect(fileName).toBe("foto-retrato-exif-6.webp");
    expect(readImageDimensions(bytes, "image/webp")).toEqual({
      width: 300,
      height: 400,
    });
  });

  test("a página do PNG também aceita JPG", async ({ page }) => {
    await open(page, "/png-para-webp");
    await input(page).setInputFiles(fixture("foto.jpg"));

    await expect(downloadLink(page)).toHaveAttribute("download", "foto.webp");
  });

  test("foto HEIC dá erro com a sugestão do conversor HEIC", async ({
    page,
  }) => {
    await open(page, "/jpg-para-webp");
    // Cabeçalho ftyp de HEIC: basta para o tipo real ser reconhecido.
    const heic = Buffer.concat([
      Buffer.from([0, 0, 0, 24]),
      Buffer.from("ftypheic\0\0\0\0mif1heic", "latin1"),
      Buffer.alloc(200),
    ]);
    await input(page).setInputFiles({
      name: "IMG_0001.heic",
      mimeType: "image/heic",
      buffer: heic,
    });

    await expect(errorAlert(page)).toContainText(
      'use a ferramenta "HEIC para JPG"',
    );
  });

  test("mudar a qualidade converte de novo e muda o tamanho", async ({
    page,
  }) => {
    await open(page, "/jpg-para-webp");
    await input(page).setInputFiles(fixture("foto.jpg"));
    await expect(downloadLink(page)).toBeVisible();
    const sizeAt80 = await page.locator("figcaption").textContent();
    const firstHref = await downloadLink(page).getAttribute("href");

    await page.getByRole("slider", { name: "Qualidade" }).fill("50");

    await expect(downloadLink(page)).not.toHaveAttribute("href", firstHref!);
    await expect(page.locator("figcaption")).not.toHaveText(sizeAt80!);
  });

  test("sem WebP no canvas (Safari), usa o codificador WASM e baixa WebP de verdade", async ({
    page,
  }) => {
    await simulateCanvasWithoutWebp(page);
    const wasmLoaded = page.waitForResponse((response) =>
      response.url().endsWith(".wasm"),
    );
    await open(page, "/png-para-webp");

    await input(page).setInputFiles(fixture("transparente.png"));

    expect((await wasmLoaded).status()).toBe(200);
    await expect(errorAlert(page)).toHaveCount(0);
    expect(
      await alphaAt(page, [
        [5, 5],
        [160, 120],
      ]),
    ).toEqual([0, 255]);
    const { bytes } = await downloadResult(page);
    expect(detectImageType(bytes)).toBe("image/webp");
    expect(readImageDimensions(bytes, "image/webp")).toEqual({
      width: 320,
      height: 240,
    });
  });

  test("nenhuma requisição de rede leva o arquivo", async ({ page }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));
    await simulateCanvasWithoutWebp(page);
    await open(page, "/png-para-webp");

    await input(page).setInputFiles(fixture("transparente.png"));
    await downloadResult(page);

    for (const request of requests) {
      expect(request.postDataBuffer(), request.url()).toBeNull();
      expect(request.url()).not.toContain("transparente");
      expect(["GET", "HEAD"]).toContain(request.method());
    }
  });
});

test.describe("Ferramentas liberadas", () => {
  test("as duas páginas entram no sitemap", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();

    for (const { path } of pages) {
      expect(body).toContain(`<loc>${siteUrl}${path}</loc>`);
    }
  });

  test("o menu de ferramentas leva às duas páginas", async ({
    page,
    isMobile,
  }) => {
    await open(page, "/");
    const button = page.getByRole("button", { name: "Ferramentas" });
    if (isMobile) await button.click();
    else await button.hover();

    const link = page.getByRole("link", { name: "JPG para WebP", exact: true });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL("/jpg-para-webp");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Converter JPG para WebP",
    );
  });
});
