import { expect, test } from "@playwright/test";

import { siteConfig } from "@/lib/site-config";

test.describe("Página inicial", () => {
  test("responde 200 e exibe o nome do site", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: siteConfig.name }),
    ).toBeVisible();
  });

  test("usa o nome do site no título e o idioma pt-BR", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(siteConfig.name);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });
});
