"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  initialCropRect,
  isRectWithin,
  toImagePixels,
  type Rect,
  type Size,
} from "@/lib/image/crop-geometry";

type CropperParts = {
  destroy: () => void;
  canvas: HTMLElement;
  image: HTMLElement & { $center: (size?: string) => unknown };
  selection: HTMLElement &
    Rect & {
      aspectRatio: number;
      $change: (
        x: number,
        y: number,
        width?: number,
        height?: number,
        aspectRatio?: number,
        force?: boolean,
      ) => unknown;
      $move: (x: number, y?: number) => unknown;
      $resize: (
        action: string,
        offsetX?: number,
        offsetY?: number,
        aspectRatio?: number,
      ) => unknown;
    };
};

/*
 * Imagem parada (sem girar, mover ou dar zoom pelo editor): só a seleção se
 * mexe. A rotação é aplicada na prévia, antes de abrir o editor. O teclado
 * nativo do Cropper.js fica desligado (escuta a página inteira e bloquearia
 * a rolagem pelas setas): a área do editor trata as setas quando focada.
 */
const TEMPLATE =
  "<cropper-canvas background>" +
  '<cropper-image initial-fit="contain"></cropper-image>' +
  '<cropper-handle action="select" plain></cropper-handle>' +
  "<cropper-selection movable resizable outlined precise>" +
  "<cropper-grid bordered covered></cropper-grid>" +
  "<cropper-crosshair centered></cropper-crosshair>" +
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
  ["n", "e", "s", "w", "ne", "nw", "se", "sw"]
    .map((side) => `<cropper-handle action="${side}-resize"></cropper-handle>`)
    .join("") +
  "</cropper-selection>" +
  "</cropper-canvas>";

/** Passo do teclado, em pixels da tela. */
const KEYBOARD_STEP = 4;

/** Onde a imagem aparece, em pixels da tela, relativo ao canvas (como a seleção). */
function getDisplayRect(parts: CropperParts): Rect {
  const canvasBox = parts.canvas.getBoundingClientRect();
  const imageBox = parts.image.getBoundingClientRect();
  return {
    x: imageBox.left - canvasBox.left,
    y: imageBox.top - canvasBox.top,
    width: imageBox.width,
    height: imageBox.height,
  };
}

/** Seleção nova da proporção: a maior possível, centralizada na imagem. */
function resetSelection(parts: CropperParts, ratio?: number) {
  const rect = initialCropRect(getDisplayRect(parts), ratio);
  const aspectRatio = ratio ?? Number.NaN;
  parts.selection.aspectRatio = aspectRatio;
  parts.selection.$change(
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    aspectRatio,
    true,
  );
}

type CropEditorProps = {
  /** URL `blob:` da prévia (já de pé e girada). */
  src: string;
  /** Dimensões reais da imagem girada (a prévia pode ser menor). */
  imageSize: Size;
  /** Largura ÷ altura; sem valor, corte livre. */
  ratio?: number;
  /** Recebe o corte em pixels da imagem real, a cada mudança. */
  onCropChange: (crop: Rect) => void;
};

/**
 * Área de corte com o Cropper.js, carregado só quando a imagem é escolhida.
 * Mouse e toque pelo Cropper.js; teclado pelas setas (mover) e Shift +
 * setas (redimensionar). A seleção nunca sai da imagem.
 */
export function CropEditor({
  src,
  imageSize,
  ratio,
  onCropChange,
}: CropEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<CropperParts | undefined>(undefined);
  const propsRef = useRef({ imageSize, ratio, onCropChange });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    propsRef.current = { imageSize, ratio, onCropChange };
  });

  // Cria o editor para cada prévia (ao escolher a imagem e ao girar).
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    const report = (parts: CropperParts, selection: Rect) => {
      const { imageSize, ratio, onCropChange } = propsRef.current;
      onCropChange(
        toImagePixels(selection, getDisplayRect(parts), imageSize, ratio),
      );
    };

    async function create() {
      setStatus("loading");
      try {
        const { default: Cropper } = await import("cropperjs");
        if (cancelled || !host) return;

        const image = document.createElement("img");
        image.src = src;
        image.alt = "Imagem a cortar";
        const cropper = new Cropper(image, {
          container: host,
          template: TEMPLATE,
        });
        const parts = {
          destroy: () => cropper.destroy(),
          canvas: cropper.getCropperCanvas(),
          image: cropper.getCropperImage(),
          selection: cropper.getCropperSelection(),
        } as unknown as CropperParts;
        partsRef.current = parts;

        // Cor de destaque do site (contorno e alças da seleção).
        const primary = getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim();
        if (primary) parts.canvas.setAttribute("theme-color", primary);

        // A seleção só muda se continuar dentro da imagem.
        parts.selection.addEventListener("change", (event) => {
          const detail = (event as CustomEvent<Rect>).detail;
          // Folga de 1 px: o Cropper.js arredonda posição e tamanho.
          if (!isRectWithin(detail, getDisplayRect(parts), 1)) {
            event.preventDefault();
            return;
          }
          report(parts, detail);
        });

        await (
          parts.image as unknown as { $ready: () => Promise<unknown> }
        ).$ready();
        if (cancelled) return;
        resetSelection(parts, propsRef.current.ratio);
        setStatus("ready");

        // Tela mudou de tamanho: encaixa a imagem de novo e refaz a seleção.
        resizeObserver = new ResizeObserver(() => {
          parts.image.$center("contain");
          resetSelection(parts, propsRef.current.ratio);
        });
        resizeObserver.observe(host);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    // O canvas do Cropper.js bloqueia a rolagem da página com a roda do
    // mouse (para dar zoom, que está desligado): o evento para aqui.
    const stopWheel = (event: WheelEvent) => event.stopPropagation();
    host.addEventListener("wheel", stopWheel, { capture: true });

    void create();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      host.removeEventListener("wheel", stopWheel, { capture: true });
      partsRef.current?.destroy();
      partsRef.current = undefined;
      host.replaceChildren();
    };
  }, [src]);

  // Nova proporção: seleção nova, a maior possível e centralizada.
  useEffect(() => {
    const parts = partsRef.current;
    if (!parts || status !== "ready") return;
    resetSelection(parts, ratio);
  }, [ratio, status]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const parts = partsRef.current;
    if (!parts) return;
    const step = KEYBOARD_STEP;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();

    const { selection } = parts;
    if (event.shiftKey) {
      // Shift + setas: aumenta ou diminui pela borda direita e de baixo.
      const [dx, dy] = move;
      if (dx !== 0) selection.$resize("e-resize", dx, 0, selection.aspectRatio);
      else selection.$resize("s-resize", 0, dy, selection.aspectRatio);
    } else {
      selection.$move(move[0], move[1]);
    }
  }

  return (
    <div className="relative">
      {/*
       * O grupo focável descreve a área para o leitor de tela; o desenho do
       * Cropper.js (grade, alças) fica escondido dele.
       */}
      <div
        role="group"
        tabIndex={0}
        aria-label="Área de corte"
        aria-describedby="crop-editor-hint"
        aria-busy={status === "loading" || undefined}
        data-testid="crop-editor"
        onKeyDown={handleKeyDown}
        className="h-[min(60vh,28rem)] w-full overflow-hidden rounded-card bg-surface-muted shadow-card outline-none focus-visible:ring-4 focus-visible:ring-ring"
      >
        <div
          ref={hostRef}
          aria-hidden="true"
          className="h-full w-full [&_cropper-canvas]:block [&_cropper-canvas]:h-full [&_cropper-canvas]:w-full"
        />
      </div>
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner label="Abrindo o editor…" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center p-4">
          <Alert variant="error" title="Não deu para abrir o editor">
            Recarregue a página e escolha a imagem de novo.
          </Alert>
        </div>
      )}
      <p id="crop-editor-hint" className="mt-2 text-sm text-muted">
        Arraste a seleção ou as bordas. No teclado: setas movem, Shift + setas
        mudam o tamanho.
      </p>
    </div>
  );
}
