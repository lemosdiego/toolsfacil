import { readFile, stat } from "node:fs/promises";
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
 * Compactar imagem (fase 11), de ponta a ponta, em dev e no build de produção.
 */

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

const path = "/compactar-imagem";
const h1 = "Compactar imagem";

function fixture(name: string) {
  return join(__dirname, "..", "fixtures", name);
}

const input = (page: Page) => page.getByTestId("image-input");

/** Abre a página e espera a hidratação (antes dela, o seletor não reage). */
async function open(page: Page, target = path) {
  await page.goto(target);
  await page.waitForLoadState("networkidle");
}
const errorAlert = (page: Page) => page.getByRole("main").getByRole("alert");
const downloadLink = (page: Page, label: "JPG" | "PNG" | "WebP") =>
  page.getByRole("link", { name: `Baixar imagem em ${label}` });

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

/** Alfa de alguns pontos do resultado, lido na própria página. */
async function alphaAt(link: Locator, points: [number, number][]) {
  const href = await link.getAttribute("href");
  return link.page().evaluate(
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

async function chooseMaxSizeMode(page: Page) {
  await page.getByText("Tamanho máximo", { exact: true }).click();
}

test.describe("Página Compactar imagem", () => {
  test("tem h1, metadados, canonical e JSON-LD", async ({ page }) => {
    await open(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expect(page).toHaveTitle(
      "Compactar imagem online: reduza KB de JPG, PNG e WebP | Tools Fácil",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /sem enviar sua imagem/,
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
    expect(app).not.toHaveProperty("aggregateRating");
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

    await chooseMaxSizeMode(page);
    await page.getByText("Outro", { exact: true }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`sem violações de acessibilidade no tema ${colorScheme}, nos dois modos`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await open(page);
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await input(page).setInputFiles(fixture("foto-detalhada.jpg"));
      await expect(downloadLink(page, "JPG")).toBeVisible();
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await chooseMaxSizeMode(page);
      await page.getByText("Outro", { exact: true }).click();
      await page.getByRole("textbox", { name: "Tamanho em KB" }).fill("abc");
      await expect(page.getByText("Qualidade usada:")).toBeVisible();
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await input(page).setInputFiles(fixture("transparente.png"));
      await expect(page.getByText("PNG otimizado sem perdas")).toBeVisible();
      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});

test.describe("Compactação", () => {
  test("o JPG sai menor, com as mesmas dimensões e o mesmo formato", async ({
    page,
  }) => {
    const original = (await stat(fixture("foto-detalhada.jpg"))).size;
    await open(page);

    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));

    const { fileName, bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(fileName).toBe("foto-detalhada-compactada.jpg");
    expect(detectImageType(bytes)).toBe("image/jpeg");
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 720,
      height: 540,
    });
    expect(bytes.length).toBeLessThan(original * 0.8);
    await expect(
      page.getByText("Essa imagem já está bem otimizada"),
    ).toHaveCount(0);
  });

  test("o PNG sai PNG, menor e com a transparência, otimizado pelo oxipng", async ({
    page,
  }) => {
    const original = (await stat(fixture("transparente.png"))).size;
    const wasmLoaded = page.waitForResponse((response) =>
      response.url().endsWith(".wasm"),
    );
    await open(page);

    await input(page).setInputFiles(fixture("transparente.png"));

    expect((await wasmLoaded).status()).toBe(200);
    const link = downloadLink(page, "PNG");
    await expect(link).toBeVisible();
    await expect(page.getByText("PNG otimizado sem perdas")).toBeVisible();
    await expect(page.getByRole("slider")).toHaveCount(0);
    expect(
      await alphaAt(link, [
        [5, 5],
        [160, 120],
      ]),
    ).toEqual([0, 255]);
    const { fileName, bytes } = await downloadResult(link);
    expect(fileName).toBe("transparente-compactada.png");
    expect(detectImageType(bytes)).toBe("image/png");
    expect(readImageDimensions(bytes, "image/png")).toEqual({
      width: 320,
      height: 240,
    });
    expect(bytes.length).toBeLessThan(original);
  });

  test("o WebP continua WebP", async ({ page }) => {
    await open(page);

    await input(page).setInputFiles(fixture("imagem.webp"));

    const { fileName, bytes } = await downloadResult(
      downloadLink(page, "WebP"),
    );
    expect(fileName).toBe("imagem-compactada.webp");
    expect(detectImageType(bytes)).toBe("image/webp");
  });

  test("sem WebP no canvas (Safari), o WebP sai pelo codificador WASM", async ({
    page,
  }) => {
    await simulateCanvasWithoutWebp(page);
    const wasmLoaded = page.waitForResponse((response) =>
      response.url().endsWith(".wasm"),
    );
    await open(page);

    await input(page).setInputFiles(fixture("imagem.webp"));

    expect((await wasmLoaded).status()).toBe(200);
    await expect(errorAlert(page)).toHaveCount(0);
    const { bytes } = await downloadResult(downloadLink(page, "WebP"));
    expect(detectImageType(bytes)).toBe("image/webp");
  });

  test("no modo Tamanho máximo, o arquivo baixado tem até 100 KB", async ({
    page,
  }) => {
    await open(page);
    await chooseMaxSizeMode(page);

    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));

    await expect(page.getByText("Qualidade usada:")).toBeVisible();
    const { bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(detectImageType(bytes)).toBe("image/jpeg");
    expect(bytes.length).toBeLessThanOrEqual(100 * 1024);
    expect(bytes.length).toBeGreaterThan(50 * 1024);
  });

  test("avisa quando nem a qualidade mínima cabe no limite", async ({
    page,
  }) => {
    await open(page);
    await chooseMaxSizeMode(page);
    await page.getByText("Outro", { exact: true }).click();
    await page.getByRole("textbox", { name: "Tamanho em KB" }).fill("10");

    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));

    await expect(page.getByText("Não coube em 10 KB")).toBeVisible();
    await expect(downloadLink(page, "JPG")).toBeVisible();
  });

  test("mudar a qualidade compacta de novo e muda o tamanho", async ({
    page,
  }) => {
    await open(page);
    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));
    await expect(downloadLink(page, "JPG")).toBeVisible();
    const sizeAt75 = await page.locator("figcaption").textContent();

    await page.getByRole("slider", { name: "Qualidade" }).fill("40");

    await expect(page.locator("figcaption")).not.toHaveText(sizeAt75!);
  });

  test("foto JPG com EXIF de orientação 6 sai de pé", async ({ page }) => {
    await open(page);
    await input(page).setInputFiles(fixture("foto-retrato-exif-6.jpg"));

    const { bytes } = await downloadResult(downloadLink(page, "JPG"));
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 300,
      height: 400,
    });
  });

  test("nenhuma requisição de rede leva o arquivo", async ({ page }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));
    await open(page);

    await input(page).setInputFiles(fixture("transparente.png"));
    await downloadResult(downloadLink(page, "PNG"));
    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));
    await downloadResult(downloadLink(page, "JPG"));

    for (const request of requests) {
      expect(request.postDataBuffer(), request.url()).toBeNull();
      expect(request.url()).not.toContain("transparente");
      expect(request.url()).not.toContain("foto-detalhada");
      expect(["GET", "HEAD"]).toContain(request.method());
    }
  });
});

test.describe("Compactar imagem liberada", () => {
  test("entra no sitemap", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();

    expect(body).toContain(`<loc>${siteUrl}${path}</loc>`);
  });

  test("o menu de ferramentas leva à página", async ({ page, isMobile }) => {
    await open(page, "/");
    const button = page.getByRole("button", { name: "Ferramentas" });
    if (isMobile) await button.click();
    else await button.hover();

    const link = page.getByRole("link", {
      name: "Compactar imagem",
      exact: true,
    });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  });

  test("a ação Compactar da home leva a imagem até a ferramenta", async ({
    page,
  }) => {
    await open(page, "/");
    await input(page).setInputFiles(fixture("foto-detalhada.jpg"));

    await page.getByRole("link", { name: "Compactar", exact: true }).click();

    await expect(page).toHaveURL(path);
    await expect(downloadLink(page, "JPG")).toHaveAttribute(
      "download",
      "foto-detalhada-compactada.jpg",
    );
  });
});
