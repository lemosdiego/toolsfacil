"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fecha um popover quando a rota muda. Necessário porque o layout
 * persiste entre as navegações do Next, e o menu ficaria aberto.
 */
export function ClosePopoverOnNavigate({ popoverId }: { popoverId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const popover = document.getElementById(popoverId);
    if (!popover || typeof popover.hidePopover !== "function") return;

    try {
      if (popover.matches(":popover-open")) popover.hidePopover();
    } catch {
      // Navegador sem suporte à Popover API: nada a fechar.
    }
  }, [pathname, popoverId]);

  return null;
}
