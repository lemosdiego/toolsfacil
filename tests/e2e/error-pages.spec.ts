import { expect, test } from "@playwright/test";

import { findAccessibilityViolations } from "./accessibility";
import { isProductionServer } from "./server-mode";

const missingPath = "/endereco-que-nao-existe";
const errorExamplePath = "/styleguide/erro";

test.describe("Página não encontrada", () => {
  test("URL inexistente responde 404 com a página em português", async ({
    page,
  }) => {
    const response = await page.goto(missingPath);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("ferramenta em breve digitada na mão responde 404", async ({ page }) => {
    const response = await page.goto("/heic-para-jpg");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeVisible();
  });

  test("o botão leva à página inicial", async ({ page }) => {
    await page.goto(missingPath);

    await page.getByRole("link", { name: "Ir para a página inicial" }).click();

    await expect(page).toHaveURL("/");
  });

  test("no celular, botão acima da dobra e sem rolagem horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(missingPath);

    await expect(
      page.getByRole("link", { name: "Ir para a página inicial" }),
    ).toBeInViewport({ ratio: 1 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`não tem violações de acessibilidade no tema ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(missingPath);

      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});

test.describe("Tela de erro em produção", () => {
  test.skip(!isProductionServer, "só no build de produção");

  test("o exemplo de erro responde 404", async ({ page }) => {
    const response = await page.goto(errorExamplePath);

    expect(response?.status()).toBe(404);
  });
});

test.describe("Tela de erro", () => {
  test.skip(isProductionServer, "o exemplo só existe em desenvolvimento");

  test("mostra a tela de erro em português, com o header", async ({ page }) => {
    await page.goto(errorExamplePath);

    await expect(
      page.getByRole("heading", { level: 1, name: "Algo deu errado" }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    // Em dev, o painel do Next mostra a mensagem; a página, não.
    await expect(
      page.getByRole("main").getByText("Erro de exemplo do styleguide"),
    ).toHaveCount(0);
  });

  test("tentar de novo renderiza a página outra vez", async ({ page }) => {
    await page.goto(errorExamplePath);
    const retry = page.getByRole("button", { name: "Tentar de novo" });

    await retry.click();

    // O exemplo sempre falha: depois de tentar, a tela de erro volta.
    await expect(
      page.getByRole("heading", { level: 1, name: "Algo deu errado" }),
    ).toBeVisible();
    await expect(retry).toBeEnabled();
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`não tem violações de acessibilidade no tema ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(errorExamplePath);
      await expect(
        page.getByRole("heading", { level: 1, name: "Algo deu errado" }),
      ).toBeVisible();

      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});
