import { join } from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { isProductionServer } from "./server-mode";

declare global {
  interface Window {
    __cspViolations: string[];
  }
}

/** Guarda toda violação de CSP da página, desde antes do carregamento. */
async function watchCspViolations(page: Page) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push(
        `${event.violatedDirective} bloqueou ${event.blockedURI || "inline"}`,
      );
    });
  });
}

async function cspViolations(page: Page) {
  return page.evaluate(() => window.__cspViolations);
}

const pages = [
  "/",
  "/endereco-que-nao-existe",
  "/png-para-webp",
  "/jpg-para-webp",
  "/compactar-imagem",
  "/cortador-de-imagem",
];
const devPages = ["/styleguide", "/styleguide/erro"];

test.describe("Cabeçalhos de segurança", () => {
  test("toda página responde com a CSP e os cabeçalhos de proteção", async ({
    page,
  }) => {
    for (const path of pages) {
      const response = await page.goto(path);
      const headers = response?.headers() ?? {};

      expect(headers["content-security-policy"], path).toContain(
        "default-src 'self'",
      );
      expect(headers["content-security-policy"], path).toContain(
        "frame-ancestors 'none'",
      );
      expect(headers["x-content-type-options"], path).toBe("nosniff");
      expect(headers["referrer-policy"], path).toBe(
        "strict-origin-when-cross-origin",
      );
      expect(headers["permissions-policy"], path).toContain("camera=()");
      expect(headers["cross-origin-opener-policy"], path).toBe("same-origin");
      expect(headers["x-frame-options"], path).toBe("DENY");
    }
  });

  test("HSTS e upgrade para https só no build de produção", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const headers = response?.headers() ?? {};

    if (isProductionServer) {
      expect(headers["strict-transport-security"]).toContain("max-age=");
      expect(headers["content-security-policy"]).toContain(
        "upgrade-insecure-requests",
      );
    } else {
      expect(headers["strict-transport-security"]).toBeUndefined();
      expect(headers["content-security-policy"]).toContain("'unsafe-eval'");
    }
  });
});

test.describe("Sem violações de CSP", () => {
  for (const path of pages) {
    test(`em ${path}`, async ({ page }) => {
      await watchCspViolations(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await cspViolations(page)).toEqual([]);
    });
  }

  for (const path of devPages) {
    test(`em ${path} (só em dev)`, async ({ page }) => {
      test.skip(isProductionServer, "a página só existe em desenvolvimento");
      await watchCspViolations(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await cspViolations(page)).toEqual([]);
    });
  }

  test("ao processar uma imagem no exemplo de ferramenta (só em dev)", async ({
    page,
  }) => {
    test.skip(isProductionServer, "a página só existe em desenvolvimento");
    await watchCspViolations(page);
    await page.goto("/styleguide/ferramenta");
    await page
      .getByTestId("image-input")
      .setInputFiles(join(__dirname, "..", "fixtures", "transparente.png"));
    await expect(
      page.getByRole("img", { name: "Prévia da imagem convertida" }),
    ).toBeVisible();

    expect(await cspViolations(page)).toEqual([]);
  });
});
