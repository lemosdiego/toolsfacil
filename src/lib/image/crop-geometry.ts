import { MAX_PIXELS, MAX_SIDE } from "./image-limits";

export type Size = { width: number; height: number };
export type Rect = Size & { x: number; y: number };

/** Rotação no sentido horário, em graus. */
export type Rotation = 0 | 90 | 180 | 270;

/** Próxima rotação de 90° no sentido horário. */
export function nextRotation(rotation: Rotation): Rotation {
  return ((rotation + 90) % 360) as Rotation;
}

/** Dimensões depois de girar (90° e 270° trocam largura e altura). */
export function rotatedSize(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

/**
 * Maior retângulo da proporção que cabe na área, centralizado. Sem
 * proporção (corte livre), a área inteira.
 */
export function initialCropRect(area: Rect, ratio?: number): Rect {
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return { ...area };

  let width = area.width;
  let height = width / ratio;
  if (height > area.height) {
    height = area.height;
    width = height * ratio;
  }
  return {
    x: area.x + (area.width - width) / 2,
    y: area.y + (area.height - height) / 2,
    width,
    height,
  };
}

/** O retângulo está dentro da área? (com folga para o arredondamento) */
export function isRectWithin(rect: Rect, area: Rect, tolerance = 0.5): boolean {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x >= area.x - tolerance &&
    rect.y >= area.y - tolerance &&
    rect.x + rect.width <= area.x + area.width + tolerance &&
    rect.y + rect.height <= area.y + area.height + tolerance
  );
}

/**
 * Converte a seleção da tela (pixels do editor) para pixels da imagem.
 * - `display`: onde a imagem aparece no editor (mesma referência da seleção)
 * - `image`: dimensões reais da imagem (já girada)
 * - `ratio`: com proporção fixa, o resultado a respeita exatamente
 * Bordas a menos de 1 pixel da tela da borda da imagem grudam nela.
 */
export function toImagePixels(
  selection: Rect,
  display: Rect,
  image: Size,
  ratio?: number,
): Rect {
  const scale = image.width / display.width;
  const snap = scale; // 1 pixel da tela, em pixels da imagem

  let left = (selection.x - display.x) * scale;
  let top = (selection.y - display.y) * scale;
  let right = left + selection.width * scale;
  let bottom = top + selection.height * scale;

  if (left < snap) left = 0;
  if (top < snap) top = 0;
  if (image.width - right < snap) right = image.width;
  if (image.height - bottom < snap) bottom = image.height;

  let x = clamp(Math.round(left), 0, image.width - 1);
  const y = clamp(Math.round(top), 0, image.height - 1);
  let width = clamp(Math.round(right) - x, 1, image.width - x);
  let height = clamp(Math.round(bottom) - y, 1, image.height - y);

  if (ratio && Number.isFinite(ratio) && ratio > 0) {
    // Ajusta a altura pela largura; se não couber, a largura pela altura.
    const fitted = Math.max(1, Math.round(width / ratio));
    if (y + fitted <= image.height) {
      height = fitted;
    } else {
      height = image.height - y;
      width = Math.max(1, Math.round(height * ratio));
      x = Math.min(x, image.width - width);
    }
  }

  return { x, y, width, height };
}

/**
 * Novo tamanho final quando a pessoa muda um dos lados. Com a proporção
 * travada, o outro lado acompanha a proporção do corte.
 */
export function resizeWithLock(
  current: Size,
  change: Partial<Size>,
  lockedRatio?: number,
): Size {
  if (change.width !== undefined) {
    return {
      width: change.width,
      height: lockedRatio
        ? Math.max(1, Math.round(change.width / lockedRatio))
        : current.height,
    };
  }
  if (change.height !== undefined) {
    return {
      width: lockedRatio
        ? Math.max(1, Math.round(change.height * lockedRatio))
        : current.width,
      height: change.height,
    };
  }
  return current;
}

/** Reduz para caber num lado máximo, mantendo a proporção (nunca aumenta). */
export function fitWithin(size: Size, maxSide: number): Size {
  const scale = Math.min(1, maxSide / Math.max(size.width, size.height));
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

export type OutputSizeCheck =
  { ok: true } | { ok: false; reason: "invalid" | "too-large" };

/** O tamanho final é válido e cabe nos limites do navegador? */
export function checkOutputSize({ width, height }: Size): OutputSizeCheck {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return { ok: false, reason: "invalid" };
  }
  if (width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) {
    return { ok: false, reason: "too-large" };
  }
  return { ok: true };
}

/**
 * Tamanhos intermediários para reduzir em etapas (metade por vez), até
 * chegar perto do final. A última etapa é sempre o tamanho final. Reduzir
 * direto de muito grande para pequeno serrilha a imagem.
 */
export function stepDownSizes(from: Size, to: Size): Size[] {
  const steps: Size[] = [];
  let { width, height } = from;
  while (width / 2 >= to.width && height / 2 >= to.height) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    if (width === to.width && height === to.height) break;
    steps.push({ width, height });
  }
  steps.push({ width: to.width, height: to.height });
  return steps;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
