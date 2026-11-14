// Versão single-thread do oxipng, importada direto: a com threads exige os
// cabeçalhos COOP/COEP (que atrapalham o AdSense) e ficaria fora do bundle.
import init, {
  optimise_raw,
} from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";

/** Nível do oxipng (0 a 6): o 2 é o padrão, rápido e com bom ganho. */
const OXIPNG_LEVEL = 2;

let ready: Promise<unknown> | undefined;

/**
 * Gera um PNG otimizado sem perdas (oxipng em WASM) a partir dos pixels:
 * escolhe o melhor tipo de cor e a melhor compressão, sem mudar a imagem.
 * Carregado só com `import()` dinâmico, dentro do Web Worker, quando a
 * pessoa escolhe um PNG para compactar.
 */
export async function optimizePngWithWasm(imageData: ImageData): Promise<Blob> {
  ready ??= init();
  await ready;
  const bytes = optimise_raw(
    imageData.data,
    imageData.width,
    imageData.height,
    OXIPNG_LEVEL,
    false,
    // Zera a cor dos pixels 100% transparentes (invisível, comprime melhor).
    true,
  );
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "image/png" });
}
