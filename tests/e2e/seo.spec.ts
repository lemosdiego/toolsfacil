import { expect, test } from "@playwright/test";

// Mesma regra do src/lib/seo.ts: sem a variável, localhost:3000 (só em dev).
// O Next grava a URL da home sem a barra final.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

test.describe("SEO da home", () => {
  test("tem título, descrição, canonical e Open Graph", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(
      "Tools Fácil: Ferramentas de imagem online e grátis",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /direto no navegador/,
    );
    const homeUrl = new RegExp(`^${siteUrl}/?$`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      homeUrl,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      homeUrl,
    );
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Tools Fácil",
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "pt_BR",
    );
  });

  test("a imagem do Open Graph existe e é um PNG 1200 × 630", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const imageUrl = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(imageUrl).toMatch(new RegExp(`^${siteUrl}/opengraph-image`));
    await expect(
      page.locator('meta[property="og:image:width"]'),
    ).toHaveAttribute("content", "1200");

    const response = await request.get(new URL(imageUrl ?? "").pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("a página não encontrada usa o modelo de título", async ({ page }) => {
    await page.goto("/endereco-que-nao-existe");

    await expect(page).toHaveTitle("Página não encontrada | Tools Fácil");
  });
});

test.describe("Sitemap e robots", () => {
  test("sitemap.xml lista a home com URL absoluta", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain(`<loc>${siteUrl}/</loc>`);
    // Ferramentas "Em breve" não entram.
    expect(body).not.toContain("/heic-para-jpg");
  });

  test("robots.txt bloqueia /api/ e aponta para o sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
  });
});
