import { cn } from "@/lib/cn";

export type AdPosition = "top" | "below-tool" | "sidebar" | "in-content";

/**
 * Altura reservada por posição, para o anúncio não empurrar a página (CLS).
 * Ajustar na fase 16 com os tamanhos realmente servidos.
 */
const positionClasses: Record<AdPosition, string> = {
  // Faixa horizontal baixa (banner de 90px), só no desktop.
  top: "min-h-[90px]",
  "below-tool": "min-h-[280px] sm:min-h-[250px]",
  "in-content": "min-h-[280px] sm:min-h-[250px]",
  // Lateral só existe em telas largas; nunca no celular.
  sidebar: "min-h-[600px]",
};

type AdSlotProps = {
  position: AdPosition;
  className?: string;
};

/**
 * Espaço reservado para anúncio. Ainda sem o script do AdSense (fase 16).
 *
 * - Sem `NEXT_PUBLIC_ADSENSE_CLIENT_ID` em produção: não renderiza nada.
 * - Sem a variável em desenvolvimento: mostra um contorno para visualizar a posição.
 * - Com a variável: reserva a altura (o anúncio entra na fase 16).
 *
 * Nunca coloque um AdSlot colado à área de soltar arquivo ou ao botão de
 * download (política do AdSense). O ToolPageLayout já garante a distância.
 */
export function AdSlot({ position, className }: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!clientId && !isDevelopment) return null;

  return (
    <aside
      aria-label="Publicidade"
      data-ad-position={position}
      className={cn(
        "flex w-full flex-col gap-1",
        (position === "sidebar" || position === "top") && "hidden lg:flex",
        className,
      )}
    >
      <span className="text-xs text-muted">Publicidade</span>
      <div
        className={cn(
          "w-full rounded-control",
          positionClasses[position],
          !clientId &&
            "grid place-items-center border border-dashed border-line-strong p-4 text-center text-sm text-muted",
        )}
      >
        {!clientId && `Espaço reservado para anúncio (${position})`}
      </div>
    </aside>
  );
}
