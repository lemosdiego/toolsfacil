import { expect, test, type Page } from "@playwright/test";

import { toolCategories, tools } from "@/lib/tools";

import { findAccessibilityViolations } from "./accessibility";

const menuSelector = "#menu-ferramentas";

function menuButton(page: Page) {
  return page.getByRole("button", { name: "Ferramentas" });
}

/** Abre o menu do jeito de cada aparelho: toque no celular, mouse no desktop. */
async function openMenu(page: Page, isMobile: boolean) {
  if (isMobile) {
    await menuButton(page).tap();
  } else {
    await menuButton(page).hover();
  }
  await expect(page.locator(menuSelector)).toBeVisible();
}

test.describe("Header e menu de ferramentas", () => {
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

  test("o menu mostra as categorias e as ferramentas do registro", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    const menu = page.locator(menuSelector);
    await expect(menu).toBeHidden();

    await openMenu(page, isMobile);
    for (const category of toolCategories) {
      await expect(
        menu.getByRole("list", { name: category.label }),
      ).toBeVisible();
    }
    for (const tool of tools) {
      await expect(menu.getByText(tool.name)).toBeVisible();
    }
    await expect(
      menu.getByText("Em breve", { exact: true }).first(),
    ).toBeVisible();
  });

  test("fecha com Esc e devolve o foco ao botão (teclado)", async ({
    page,
  }) => {
    await page.goto("/");
    const menu = page.locator(menuSelector);

    await menuButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test("fecha ao clicar ou tocar fora", async ({ page, isMobile }) => {
    await page.goto("/");
    const menu = page.locator(menuSelector);

    await openMenu(page, isMobile);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("sem viewport");
    const outside = { x: viewport.width / 2, y: viewport.height - 20 };

    if (isMobile) {
      await page.touchscreen.tap(outside.x, outside.y);
    } else {
      await page.mouse.click(outside.x, outside.y);
    }
    await expect(menu).toBeHidden();
  });

  test.describe("com o mouse", () => {
    test.skip(({ isMobile }) => isMobile, "celular não tem hover");

    test("abre ao passar o mouse e continua aberto no painel e no clique", async ({
      page,
    }) => {
      await page.goto("/");
      const menu = page.locator(menuSelector);

      await menuButton(page).hover();
      await expect(menu).toBeVisible();

      // Atravessa o espaço entre o botão e o painel sem fechar.
      await menu.hover();
      await expect(menu).toBeVisible();

      // O clique depois do hover não fecha o menu.
      await menuButton(page).click();
      await expect(menu).toBeVisible();
    });

    test("fecha ao tirar o mouse do botão e do painel", async ({ page }) => {
      await page.goto("/");
      const menu = page.locator(menuSelector);

      await menuButton(page).hover();
      await expect(menu).toBeVisible();

      const viewport = page.viewportSize();
      if (!viewport) throw new Error("sem viewport");
      await page.mouse.move(viewport.width / 2, viewport.height - 20, {
        steps: 5,
      });
      await expect(menu).toBeHidden();
    });

    test("no desktop, as três colunas ficam lado a lado", async ({ page }) => {
      await page.goto("/");
      await menuButton(page).hover();

      const nav = page.locator(`${menuSelector} nav`);
      const columns = nav.locator(":scope > div");
      await expect(columns).toHaveCount(3);

      const tops = await columns.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().top),
      );
      expect(new Set(tops).size).toBe(1);
    });

    test("header e menu ocupam a largura da tela", async ({ page }) => {
      await page.goto("/");
      await menuButton(page).hover();

      const viewport = page.viewportSize();
      const box = await page.locator(menuSelector).boundingBox();
      if (!viewport || !box) throw new Error("sem medidas");

      // Só a margem lateral do site (1.5rem de cada lado).
      expect(box.width).toBeGreaterThanOrEqual(viewport.width - 48 - 1);
    });
  });

  test.describe("no celular (360px)", () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test("uma coluna, alvos de 44px e sem rolagem horizontal", async ({
      page,
      isMobile,
    }) => {
      await page.goto("/");
      const scrollWidth = () =>
        page.evaluate(() => document.documentElement.scrollWidth);
      expect(await scrollWidth()).toBeLessThanOrEqual(360);

      await openMenu(page, isMobile);
      expect(await scrollWidth()).toBeLessThanOrEqual(360);

      const columns = page.locator(`${menuSelector} nav > div`);
      const lefts = await columns.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().left),
      );
      expect(new Set(lefts).size).toBe(1);

      const targets = page.locator(
        `header a, header button, ${menuSelector} li > *`,
      );
      const count = await targets.count();
      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index++) {
        const box = await targets.nth(index).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`sem violações de acessibilidade com o menu aberto (tema ${colorScheme})`, async ({
      page,
      isMobile,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      await openMenu(page, isMobile);

      expect(await findAccessibilityViolations(page)).toEqual([]);
    });
  }
});
