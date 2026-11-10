"use client";

import { useEffect } from "react";

/** Tempo para o mouse atravessar o espaço entre o botão e o painel. */
const CLOSE_DELAY_MS = 150;

type OpenPopoverOnHoverProps = {
  popoverId: string;
  triggerId: string;
};

/**
 * Abre o popover quando o mouse passa sobre o botão e fecha quando sai do
 * botão e do painel. Só vale para mouse: no toque e no teclado, o botão
 * continua abrindo e fechando pelo `popovertarget`, sem JavaScript.
 */
export function OpenPopoverOnHover({
  popoverId,
  triggerId,
}: OpenPopoverOnHoverProps) {
  useEffect(() => {
    const popover = document.getElementById(popoverId);
    const trigger = document.getElementById(triggerId);
    if (!popover || !trigger || typeof popover.showPopover !== "function") {
      return;
    }

    let closeTimer: number | undefined;
    const isOpen = () => popover.matches(":popover-open");

    const cancelClose = () => window.clearTimeout(closeTimer);

    const open = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cancelClose();
      if (!isOpen()) popover.showPopover();
    };

    const scheduleClose = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cancelClose();
      closeTimer = window.setTimeout(() => {
        if (isOpen()) popover.hidePopover();
      }, CLOSE_DELAY_MS);
    };

    // Com o mouse, o hover já abriu: o clique não pode fechar o menu.
    let lastPointerType = "";
    const rememberPointer = (event: PointerEvent) => {
      lastPointerType = event.pointerType;
    };
    const keepOpenOnMouseClick = (event: MouseEvent) => {
      if (lastPointerType === "mouse" && event.detail > 0 && isOpen()) {
        event.preventDefault();
      }
    };

    trigger.addEventListener("pointerenter", open);
    trigger.addEventListener("pointerleave", scheduleClose);
    trigger.addEventListener("pointerdown", rememberPointer);
    trigger.addEventListener("click", keepOpenOnMouseClick);
    popover.addEventListener("pointerenter", open);
    popover.addEventListener("pointerleave", scheduleClose);

    return () => {
      cancelClose();
      trigger.removeEventListener("pointerenter", open);
      trigger.removeEventListener("pointerleave", scheduleClose);
      trigger.removeEventListener("pointerdown", rememberPointer);
      trigger.removeEventListener("click", keepOpenOnMouseClick);
      popover.removeEventListener("pointerenter", open);
      popover.removeEventListener("pointerleave", scheduleClose);
    };
  }, [popoverId, triggerId]);

  return null;
}
