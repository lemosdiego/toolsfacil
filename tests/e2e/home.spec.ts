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
import { siteConfig } from "@/lib/site-config";

import { findAccessibilityViolations } from "./accessibility";
import { isProductionServer } from "./server-mode";

function fixture(name: string) {
  return join(__dirname, "..", "fixtures", name);
}

/** Abre a home e espera a hidratação (antes dela, o seletor não reage). */
async function openHome(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

const input = (page: Page) => page.getByTestId("image-input");
const actionsHeading = (page: Page) =>
  page.getByRole("heading", { name: "O que você quer fazer?" });

async function choosePng(page: Page) {
  await input(page).setInputFiles(fixture("transparente.png"));
  await expect(actionsHeading(page)).toBeVisible();
}

async function verticalGap(upper: Locator, lower: Locator) {
  const [a, b] = await Promise.all([upper.boundingBox(), lower.boundingBox()]);
  if (!a || !b) throw new Error("elemento sem medidas");
  return b.y - (a.y + a.height);
}

test.describe("Página inicial", () => {
  test("responde 200, com o h1 e o idioma pt-BR", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: siteConfig.tagline }),
    ).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(siteConfig.name));
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("traz os dados estruturados WebSite e FAQPage", async ({ page }) => {
    await page.goto("/");
    const data = JSON.parse(
      (await page
        .locator('script[type="application/ld+json"]')
        .textContent()) ?? "[]",
    );

    expect(data.map((item: { "@type": string }) => item["@type"])).toEqual([
      "WebSite",
      "FAQPage",
    ]);
    await expect(page.locator("details")).toHaveCount(
      data[1].mainEntity.length,
    );
  });

  test("no celular, h1 e botão acima da dobra, sem rolagem horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openHome(page);

    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport({
      ratio: 1,
    });
    await expect(
      page.getByRole("button", { name: "Escolher imagem" }),
    ).toBeInViewport({ ratio: 1 });

    await choosePng(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
  });

  test("lista todas as ferramentas; as prontas são links", async ({ page }) => {
    await page.goto("/");
    const grid = page.getByRole("region", { name: "Todas as ferramentas" });

    await expect(
      grid.getByRole("link", { name: /PNG para WebP/ }),
    ).toHaveAttribute("href", "/png-para-webp");
    await expect(grid.getByText(/^HEIC para JPG/)).toBeVisible();
    await expect(grid.getByRole("link", { name: /HEIC para JPG/ })).toHaveCount(
      0,
    );
  });

  test("o anúncio fica a pelo menos 48px da área de escolher e das ações", async ({
    page,
  }) => {
    // Sem NEXT_PUBLIC_ADSENSE_CLIENT_ID, o build de produção não tem anúncio.
    test.skip(isProductionServer, "o espaço do anúncio só aparece em dev");
    await openHome(page);
    await choosePng(page);
    const firstAd = page.locator("[data-ad-position]").first();

    for (const part of [
      page.getByRole("link", { name: "Converter para WebP" }),
      page.locator("[data-testid='image-input']").locator(".."),
    ]) {
      expect(await verticalGap(part, firstAd)).toBeGreaterThanOrEqual(48);
    }
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`sem violações de acessibilidade no tema ${colorScheme}, antes e depois de escolher`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await openHome(page);
      expect(await findAccessibilityViolations(page)).toEqual([]);

      await choosePng(page);
      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});

test.describe("Roteador de imagem", () => {
  test("PNG: mostra o arquivo e só as ações que servem, com foco nelas", async ({
    page,
  }) => {
    await openHome(page);
    await choosePng(page);

    await expect(actionsHeading(page)).toBeFocused();
    await expect(page.getByText("transparente.png")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Converter para WebP" }),
    ).toHaveCount(1);
    // Compactar ainda não está pronta: aparece sem link, com o selo.
    const router = input(page).locator("..");
    const compress = router
      .getByRole("listitem")
      .filter({ hasText: /^Compactar/ });
    await expect(compress).toContainText("Em breve");
    await expect(compress.getByRole("link")).toHaveCount(0);
  });

  test("leva a imagem até a ferramenta, sem escolher de novo", async ({
    page,
  }) => {
    await openHome(page);
    await choosePng(page);

    await page.getByRole("link", { name: "Converter para WebP" }).click();

    await expect(page).toHaveURL("/png-para-webp");
    const download = page.getByRole("link", { name: "Baixar imagem em WebP" });
    await expect(download).toHaveAttribute("download", "transparente.webp");
    const [file] = await Promise.all([
      page.waitForEvent("download"),
      download.click(),
    ]);
    const bytes = new Uint8Array(await readFile(await file.path()));
    expect(detectImageType(bytes)).toBe("image/webp");
  });

  test("ao recarregar a ferramenta, ela abre vazia, sem erro", async ({
    page,
  }) => {
    await openHome(page);
    await choosePng(page);
    await page.getByRole("link", { name: "Converter para WebP" }).click();
    await expect(
      page.getByRole("link", { name: "Baixar imagem em WebP" }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("button", { name: "Escolher imagem" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Baixar imagem em WebP" }),
    ).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });

  test("HEIC: só o conversor de HEIC, ainda em breve, com aviso", async ({
    page,
  }) => {
    await openHome(page);
    await input(page).setInputFiles({
      name: "IMG_0001.HEIC",
      mimeType: "image/heic",
      buffer: Buffer.concat([
        Buffer.from([0, 0, 0, 24]),
        Buffer.from("ftypheic\0\0\0\0mif1heic", "latin1"),
        Buffer.alloc(200),
      ]),
    });

    await expect(actionsHeading(page)).toBeVisible();
    await expect(page.getByText("Converter para JPG")).toBeVisible();
    await expect(
      page.getByText(/Ainda não temos uma ferramenta pronta para imagens HEIC/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Converter para JPG" }),
    ).toHaveCount(0);
  });

  test("falso PNG: erro pelo tipo real", async ({ page }) => {
    await openHome(page);
    await input(page).setInputFiles(fixture("falso.png"));

    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Esse arquivo não parece ser uma imagem.",
    );
  });

  test("nenhuma requisição leva o arquivo, da home até a ferramenta", async ({
    page,
  }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));
    await openHome(page);

    await choosePng(page);
    await page.getByRole("link", { name: "Converter para WebP" }).click();
    await expect(
      page.getByRole("link", { name: "Baixar imagem em WebP" }),
    ).toBeVisible();

    for (const request of requests) {
      expect(request.postDataBuffer(), request.url()).toBeNull();
      expect(request.url()).not.toContain("transparente");
      expect(["GET", "HEAD"]).toContain(request.method());
    }
  });

  test("soltar a imagem na home mostra as ações (desktop)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "no celular não existe arrastar arquivo");
    await openHome(page);
    const base64 = (await readFile(fixture("foto.jpg"))).toString("base64");
    const dataTransfer = await page.evaluateHandle((data) => {
      const transfer = new DataTransfer();
      const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
      transfer.items.add(new File([bytes], "foto.jpg"));
      return transfer;
    }, base64);

    await page.dispatchEvent("body", "drop", { dataTransfer });

    await expect(actionsHeading(page)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Converter para WebP" }),
    ).toHaveAttribute("href", "/jpg-para-webp");
  });
});
