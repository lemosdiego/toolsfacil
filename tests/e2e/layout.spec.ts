import { expect, test } from "@playwright/test";

import { tools } from "@/lib/tools";

import { findAccessibilityViolations } from "./accessibility";
import { isProductionServer } from "./server-mode";

test.describe("Layout e navegação", () => {
  test("o link de pular é o primeiro foco e leva ao conteúdo", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#conteudo$/);
    await expect(page.locator("main#conteudo")).toBeFocused();
  });

  test("o menu de ferramentas abre pelo botão e fecha com Esc", async ({
    page,
  }) => {
    await page.goto("/");
    const menu = page.locator("#menu-ferramentas");
    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Ferramentas" }).click();
    await expect(menu).toBeVisible();
    for (const tool of tools) {
      await expect(menu.getByText(tool.name)).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("o botão de fechar do menu funciona", async ({ page }) => {
    await page.goto("/");
    const menu = page.locator("#menu-ferramentas");

    await page.getByRole("button", { name: "Ferramentas" }).click();
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: "Fechar menu" }).click();
    await expect(menu).toBeHidden();
  });

  test("os atalhos por intenção levam até o card certo", async ({ page }) => {
    await page.goto("/");
    const shortcuts = page.getByRole("navigation", {
      name: "O que você quer fazer?",
    });

    await shortcuts.getByRole("link", { name: "Compactar" }).click();

    await expect(page).toHaveURL(/#compactar-imagem$/);
    await expect(page.locator("#compactar-imagem")).toBeInViewport();
  });

  test("header e atalhos têm alvos de toque de pelo menos 44px", async ({
    page,
  }) => {
    await page.goto("/");
    const targets = page.locator(
      "header a, header button:visible, nav[aria-label='O que você quer fazer?'] a",
    );

    const count = await targets.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("não há rolagem horizontal em 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("ferramentas que ainda não existem não geram links", async ({
    page,
  }) => {
    await page.goto("/");

    for (const tool of tools.filter((item) => item.status === "soon")) {
      await expect(page.locator(`a[href="/${tool.slug}"]`)).toHaveCount(0);
    }
  });
});

test.describe("Exemplo do ToolPageLayout", () => {
  test.skip(isProductionServer, "a página de exemplo só existe em dev");

  test("a ferramenta fica acima da dobra no celular e longe do anúncio", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/styleguide/ferramenta");

    const tool = page.getByTestId("tool-placeholder");
    const ad = page.locator("[data-ad-position='below-tool']");
    const toolBox = await tool.boundingBox();
    const adBox = await ad.boundingBox();

    expect(toolBox).not.toBeNull();
    expect(adBox).not.toBeNull();
    // O topo da ferramenta aparece sem rolar.
    expect(toolBox!.y).toBeLessThan(640 - 100);
    // Pelo menos 48px entre a ferramenta e o anúncio.
    expect(adBox!.y - (toolBox!.y + toolBox!.height)).toBeGreaterThanOrEqual(
      48,
    );
  });

  test("o anúncio lateral só aparece no desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/styleguide/ferramenta");
    await expect(page.locator("[data-ad-position='sidebar']")).toBeVisible();

    await page.setViewportSize({ width: 390, height: 800 });
    await expect(page.locator("[data-ad-position='sidebar']")).toBeHidden();
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`não tem violações de acessibilidade no tema ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/styleguide/ferramenta");

      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});
