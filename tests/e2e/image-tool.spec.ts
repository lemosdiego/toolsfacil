import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { expect, test, type Page, type Request } from "@playwright/test";

import { detectImageType } from "@/lib/image/detect-image-type";
import { readImageDimensions } from "@/lib/image/read-image-dimensions";

import { isProductionServer } from "./server-mode";

/*
 * Peças das ferramentas (fase 09) no exemplo do styleguide, que regrava a
 * imagem em PNG. Só em dev: a página de exemplo não existe em produção.
 * As ferramentas reais repetem o fluxo de ponta a ponta nas fases delas.
 */

const examplePath = "/styleguide/ferramenta";

function fixture(name: string) {
  return join(__dirname, "..", "fixtures", name);
}

const input = (page: Page) => page.getByTestId("image-input");
const preview = (page: Page) =>
  page.getByRole("img", { name: "Prévia da imagem convertida" });
// O Next tem um anunciador de rota com role="alert": busca só no <main>.
const errorAlert = (page: Page) => page.getByRole("main").getByRole("alert");
const downloadLink = (page: Page) =>
  page.getByRole("link", { name: "Baixar imagem em PNG" });

/** Baixa o resultado e devolve os bytes do arquivo. */
async function downloadResult(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    downloadLink(page).click(),
  ]);
  const path = await download.path();
  return {
    fileName: download.suggestedFilename(),
    bytes: new Uint8Array(await readFile(path)),
  };
}

test.describe("Peças das ferramentas de imagem", () => {
  test.skip(isProductionServer, "o exemplo só existe em desenvolvimento");

  test.beforeEach(async ({ page }) => {
    await page.goto(examplePath);
    // Antes da hidratação, o seletor de arquivo não reage.
    await page.waitForLoadState("networkidle");
  });

  test("PNG transparente: prévia, download com o nome certo e mesmas dimensões", async ({
    page,
  }) => {
    await input(page).setInputFiles(fixture("transparente.png"));
    await expect(preview(page)).toBeVisible();
    await expect(page.locator("figcaption")).toContainText("→");

    const { fileName, bytes } = await downloadResult(page);

    expect(fileName).toBe("transparente-exemplo.png");
    expect(detectImageType(bytes)).toBe("image/png");
    expect(readImageDimensions(bytes, "image/png")).toEqual({
      width: 320,
      height: 240,
    });
  });

  test("preserva a transparência", async ({ page }) => {
    await input(page).setInputFiles(fixture("transparente.png"));
    await expect(preview(page)).toBeVisible();

    const href = await downloadLink(page).getAttribute("href");
    const [cornerAlpha, centerAlpha] = await page.evaluate(async (url) => {
      const bitmap = await createImageBitmap(await (await fetch(url!)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      return [
        context.getImageData(5, 5, 1, 1).data[3],
        context.getImageData(160, 120, 1, 1).data[3],
      ];
    }, href);

    expect(cornerAlpha).toBe(0);
    expect(centerAlpha).toBe(255);
  });

  test("foto com EXIF de orientação 6 sai de pé", async ({ page }) => {
    await input(page).setInputFiles(fixture("foto-retrato-exif-6.jpg"));
    await expect(preview(page)).toBeVisible();

    const { bytes } = await downloadResult(page);

    // Gravada em 400 × 300; com a orientação aplicada, 300 × 400.
    expect(readImageDimensions(bytes, "image/png")).toEqual({
      width: 300,
      height: 400,
    });
  });

  test("aceita WebP e JPG", async ({ page }) => {
    for (const name of ["imagem.webp", "foto.jpg"]) {
      await input(page).setInputFiles(fixture(name));
      await expect(downloadLink(page)).toHaveAttribute(
        "download",
        `${name.split(".")[0]}-exemplo.png`,
      );
    }
  });

  test("processa no Web Worker, e não na thread principal", async ({
    page,
  }) => {
    // Desliga a codificação na thread principal (o script não roda no
    // worker): se a imagem sair pronta, foi o worker que processou.
    await page.addInitScript(() => {
      const fail = () => Promise.reject(new Error("thread principal"));
      OffscreenCanvas.prototype.convertToBlob = fail;
      HTMLCanvasElement.prototype.toBlob = () => {
        throw new Error("thread principal");
      };
    });
    await page.goto(examplePath);
    await page.waitForLoadState("networkidle");
    const workerCreated = page.waitForEvent("worker");

    await input(page).setInputFiles(fixture("foto.jpg"));

    const worker = await workerCreated;
    expect(worker.url()).toContain("turbopack-worker");
    await expect(preview(page)).toBeVisible();
    await expect(errorAlert(page)).toHaveCount(0);
  });

  test("falso PNG: erro pelo tipo real", async ({ page }) => {
    await input(page).setInputFiles(fixture("falso.png"));

    await expect(errorAlert(page)).toContainText(
      "Esse arquivo não parece ser uma imagem. Escolha um arquivo PNG, JPG ou WebP.",
    );
    await expect(preview(page)).toHaveCount(0);
  });

  test("imagem acima do limite de pixels: erro com as dimensões", async ({
    page,
  }) => {
    await input(page).setInputFiles(fixture("grande-demais.png"));

    await expect(errorAlert(page)).toContainText(
      "A imagem tem 5.000 × 4.000 pixels",
    );
  });

  test("arquivo acima de 20 MB: erro de tamanho", async ({ page }) => {
    await input(page).setInputFiles({
      name: "enorme.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(21 * 1024 * 1024),
    });

    await expect(errorAlert(page)).toContainText(
      "A imagem tem 21 MB, e o limite é 20 MB.",
    );
  });

  test("escolher outra imagem troca o resultado", async ({ page }) => {
    await input(page).setInputFiles(fixture("foto.jpg"));
    await expect(downloadLink(page)).toHaveAttribute(
      "download",
      "foto-exemplo.png",
    );
    await expect(
      page.getByRole("button", { name: "Escolher outra imagem" }),
    ).toBeVisible();

    await input(page).setInputFiles(fixture("imagem.webp"));
    await expect(downloadLink(page)).toHaveAttribute(
      "download",
      "imagem-exemplo.png",
    );
  });

  test("nenhuma requisição de rede leva o arquivo", async ({ page }) => {
    const requests: Request[] = [];
    page.on("request", (request) => requests.push(request));

    await input(page).setInputFiles(fixture("transparente.png"));
    await expect(preview(page)).toBeVisible();
    await downloadResult(page);

    for (const request of requests) {
      expect(request.postDataBuffer(), request.url()).toBeNull();
      expect(request.url()).not.toContain("transparente");
      expect(["GET", "HEAD"]).toContain(request.method());
    }
  });
});

test.describe("Arrastar e soltar (desktop)", () => {
  test.skip(isProductionServer, "o exemplo só existe em desenvolvimento");

  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "no celular não existe arrastar arquivo");
  });

  /** Cria um DataTransfer na página com as fixtures, como um arrastar real. */
  async function dataTransferWith(page: Page, names: string[]) {
    const files = await Promise.all(
      names.map(async (name) => ({
        name,
        base64: (await readFile(fixture(name))).toString("base64"),
      })),
    );
    return page.evaluateHandle((items) => {
      const transfer = new DataTransfer();
      for (const { name, base64 } of items) {
        const bytes = Uint8Array.from(atob(base64), (char) =>
          char.charCodeAt(0),
        );
        transfer.items.add(new File([bytes], name));
      }
      return transfer;
    }, files);
  }

  test("soltar a imagem na página processa e destaca a prévia ao arrastar", async ({
    page,
  }) => {
    await page.goto(examplePath);
    // Os ouvintes de arrastar só existem depois da hidratação.
    await page.waitForLoadState("networkidle");
    const dataTransfer = await dataTransferWith(page, ["foto.jpg"]);

    await page.dispatchEvent("body", "dragenter", { dataTransfer });
    await expect(page.getByText("Solte a imagem para abrir")).toBeVisible();
    await page.dispatchEvent("body", "drop", { dataTransfer });

    await expect(preview(page)).toBeVisible();
    await expect(downloadLink(page)).toHaveAttribute(
      "download",
      "foto-exemplo.png",
    );
  });

  test("soltar vários arquivos abre o primeiro e avisa", async ({ page }) => {
    await page.goto(examplePath);
    // Os ouvintes de arrastar só existem depois da hidratação.
    await page.waitForLoadState("networkidle");
    const dataTransfer = await dataTransferWith(page, [
      "imagem.webp",
      "foto.jpg",
    ]);

    await page.dispatchEvent("body", "drop", { dataTransfer });

    await expect(page.getByText(/Você escolheu 2 arquivos/)).toBeVisible();
    await expect(downloadLink(page)).toHaveAttribute(
      "download",
      "imagem-exemplo.png",
    );
  });
});
