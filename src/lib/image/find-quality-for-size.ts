export type QualitySearchOptions = {
  /** Menor qualidade tentada (0 a 1). */
  minQuality: number;
  /** Maior qualidade tentada (0 a 1): o resultado nunca passa dela. */
  maxQuality: number;
  /** Teto de codificações (cada uma custa tempo, principalmente no celular). */
  maxAttempts: number;
};

export type QualitySearchResult = {
  blob: Blob;
  /** Qualidade usada no resultado (0 a 1, com duas casas). */
  quality: number;
  /** O resultado cabe no tamanho máximo? */
  fits: boolean;
};

/** Qualidade com duas casas (um ponto da escala de 0 a 100). */
function roundQuality(quality: number): number {
  return Math.round(quality * 100) / 100;
}

/**
 * Busca binária da maior qualidade cujo resultado cabe em `maxBytes`.
 * Recebe "codificar com a qualidade q" e devolve o melhor resultado:
 * - a qualidade máxima, se ela já cabe;
 * - senão, a maior qualidade que coube nas tentativas;
 * - se nem a mínima cabe, o resultado da mínima (o menor), com `fits: false`.
 * Nunca passa de `maxAttempts` codificações.
 */
export async function findQualityForSize(
  encode: (quality: number) => Promise<Blob>,
  maxBytes: number,
  { minQuality, maxQuality, maxAttempts }: QualitySearchOptions,
): Promise<QualitySearchResult> {
  let attempts = 0;
  const tryQuality = async (quality: number) => {
    attempts++;
    return { blob: await encode(quality), quality };
  };

  const high = await tryQuality(roundQuality(maxQuality));
  if (high.blob.size <= maxBytes || attempts >= maxAttempts) {
    return { ...high, fits: high.blob.size <= maxBytes };
  }

  const low = await tryQuality(roundQuality(minQuality));
  if (low.blob.size > maxBytes) return { ...low, fits: false };

  // A mínima cabe e a máxima não: a resposta está entre as duas.
  let best = low;
  let fitting = low.quality;
  let tooBig = high.quality;
  while (attempts < maxAttempts) {
    const quality = roundQuality((fitting + tooBig) / 2);
    if (quality <= fitting || quality >= tooBig) break;

    const attempt = await tryQuality(quality);
    if (attempt.blob.size <= maxBytes) {
      best = attempt;
      fitting = quality;
    } else {
      tooBig = quality;
    }
  }

  return { ...best, fits: true };
}
