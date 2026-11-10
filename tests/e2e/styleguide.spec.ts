import { expect, test } from "@playwright/test";

import { findAccessibilityViolations } from "./accessibility";
import { isProductionServer } from "./server-mode";

test.describe("Styleguide em produção", () => {
  test.skip(!isProductionServer, "só no build de produção");

  test("responde 404", async ({ page }) => {
    const response = await page.goto("/styleguide");

    expect(response?.status()).toBe(404);
  });
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`Styleguide em desenvolvimento (tema ${colorScheme})`, () => {
    test.skip(isProductionServer, "a página só existe em desenvolvimento");
    test.use({ colorScheme });

    test("abre e mostra os componentes", async ({ page }) => {
      const response = await page.goto("/styleguide");

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: "Styleguide" }),
      ).toBeVisible();
      await expect(page.getByRole("alert")).toContainText(
        "Arquivo muito grande",
      );
      await expect(
        page.getByRole("progressbar", { name: "Progresso da conversão" }),
      ).toHaveAttribute("aria-valuenow", "35");
    });

    test("não tem violações de acessibilidade (inclui contraste AA)", async ({
      page,
    }) => {
      await page.goto("/styleguide");

      expect(await findAccessibilityViolations(page)).toEqual([]);
    });

    test("botões e links-botão têm pelo menos 44px de altura", async ({
      page,
    }) => {
      await page.goto("/styleguide");

      const controls = page.locator("main button, main a[class*='min-h-']");
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);

      for (let index = 0; index < count; index++) {
        const box = await controls.nth(index).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  });
}
