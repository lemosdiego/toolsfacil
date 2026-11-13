/*
 * Gera as imagens de teste de tests/fixtures/ com o Chromium do Playwright
 * (sem ImageMagick nem exiftool). Rodar só para recriar as imagens:
 *
 *   pnpm fixtures:generate
 *
 * Todas são desenhadas aqui: sem dados pessoais e sem EXIF além da
 * orientação gravada de propósito no JPG de retrato.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { crc32, deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const outputDir = join(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
  "tests",
  "fixtures",
);

/** Segmento APP1 (EXIF) só com a tag de orientação (0x0112). */
function exifOrientationSegment(orientation) {
  const tiff = Buffer.alloc(26);
  tiff.write("MM", 0, "ascii"); // big-endian
  tiff.writeUInt16BE(0x002a, 2);
  tiff.writeUInt32BE(8, 4); // offset do IFD0
  tiff.writeUInt16BE(1, 8); // 1 entrada
  tiff.writeUInt16BE(0x0112, 10); // Orientation
  tiff.writeUInt16BE(3, 12); // SHORT
  tiff.writeUInt32BE(1, 14); // 1 valor
  tiff.writeUInt16BE(orientation, 18);
  tiff.writeUInt32BE(0, 22); // sem próximo IFD

  const payload = Buffer.concat([Buffer.from("Exif\0\0", "ascii"), tiff]);
  const header = Buffer.alloc(4);
  header.writeUInt16BE(0xffe1, 0);
  header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([header, payload]);
}

/** Insere o EXIF logo depois do SOI (FF D8) do JPG. */
function withExifOrientation(jpeg, orientation) {
  return Buffer.concat([
    jpeg.subarray(0, 2),
    exifOrientationSegment(orientation),
    jpeg.subarray(2),
  ]);
}

/**
 * PNG em tons de cinza (1 byte por pixel) com compressão máxima: imagem
 * gigante em pixels e pequena em bytes.
 */
function grayscalePng(width, height) {
  function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.writeUInt8(8, 8); // 8 bits
  header.writeUInt8(0, 9); // tons de cinza
  // Cada linha: byte de filtro (0) + um byte por pixel (cinza claro).
  const row = Buffer.alloc(width + 1, 0xe7);
  row[0] = 0;
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const browser = await chromium.launch();
const page = await browser.newPage();

const images = await page.evaluate(async () => {
  function canvas(width, height, draw) {
    const element = document.createElement("canvas");
    element.width = width;
    element.height = height;
    draw(element.getContext("2d"), width, height);
    return element;
  }

  async function encode(element, type, quality) {
    const blob = await new Promise((resolve) =>
      element.toBlob(resolve, type, quality),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  // Paisagem com faixa vermelha em cima e azul à esquerda: mostra a orientação.
  function landscape(context, width, height) {
    context.fillStyle = "#f5f5f4";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#dc2626";
    context.fillRect(0, 0, width, height / 6);
    context.fillStyle = "#2563eb";
    context.fillRect(0, 0, width / 8, height);
  }

  return {
    // Fundo transparente com um círculo: o canto (5, 5) é totalmente transparente.
    "transparente.png": await encode(
      canvas(320, 240, (context) => {
        context.fillStyle = "#16a34a";
        context.beginPath();
        context.arc(160, 120, 90, 0, Math.PI * 2);
        context.fill();
      }),
      "image/png",
    ),
    "foto.jpg": await encode(canvas(480, 320, landscape), "image/jpeg", 0.85),
    "foto-retrato-exif-6.jpg": await encode(
      canvas(400, 300, landscape),
      "image/jpeg",
      0.85,
    ),
    "imagem.webp": await encode(
      canvas(200, 200, (context) => {
        context.fillStyle = "#7c3aed";
        context.fillRect(0, 0, 200, 200);
      }),
      "image/webp",
      0.8,
    ),
  };
});

await browser.close();

const files = Object.fromEntries(
  Object.entries(images).map(([name, base64]) => [
    name,
    Buffer.from(base64, "base64"),
  ]),
);
files["foto-retrato-exif-6.jpg"] = withExifOrientation(
  files["foto-retrato-exif-6.jpg"],
  6,
);
// 5000 × 4000 = 20 milhões de pixels, acima do limite.
files["grande-demais.png"] = grayscalePng(5000, 4000);
files["falso.png"] = Buffer.from(
  "Isto é um arquivo de texto com extensão .png\n",
);

for (const [name, bytes] of Object.entries(files)) {
  await writeFile(join(outputDir, name), bytes);
  console.log(`${name}: ${bytes.length} bytes`);
}
