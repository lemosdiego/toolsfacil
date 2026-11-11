const UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * Tamanho de arquivo legível, em pt-BR (base 1024, como os sistemas mostram).
 * Ex.: 512 → "512 B", 348_160 → "340 KB", 1_258_291 → "1,2 MB".
 * Até 1 casa decimal abaixo de 100 na unidade; inteiro a partir disso.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`Tamanho inválido: ${bytes}`);
  }

  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const fractionDigits = unitIndex === 0 || value >= 100 ? 0 : 1;
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: fractionDigits,
    useGrouping: false,
  }).format(value);

  return `${formatted} ${UNITS[unitIndex]}`;
}

/**
 * Variação de tamanho em porcentagem inteira, com sinal.
 * Ex.: (1000, 280) → "-72%", (1000, 1050) → "+5%", (1000, 1000) → "0%".
 */
export function formatSizeChange(before: number, after: number): string {
  if (!(before > 0) || !Number.isFinite(after) || after < 0) {
    throw new RangeError(`Tamanhos inválidos: ${before} → ${after}`);
  }

  const percent = Math.round(((after - before) / before) * 100);
  if (percent === 0) return "0%";

  return `${percent > 0 ? "+" : "-"}${Math.abs(percent)}%`;
}
