import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClosePopoverOnNavigate } from "./close-popover-on-navigate";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

describe("ClosePopoverOnNavigate", () => {
  const hidePopover = vi.fn();

  beforeEach(() => {
    pathname = "/";
    hidePopover.mockClear();
    document.body.innerHTML = '<div id="menu"></div>';
    const menu = document.getElementById("menu");
    if (!menu) throw new Error("menu não encontrado");
    Object.assign(menu, {
      hidePopover,
      matches: (selector: string) => selector === ":popover-open",
    });
  });

  it("não fecha o menu ao carregar a página", () => {
    render(<ClosePopoverOnNavigate popoverId="menu" />);

    expect(hidePopover).not.toHaveBeenCalled();
  });

  it("fecha o menu quando a rota muda", () => {
    const { rerender } = render(<ClosePopoverOnNavigate popoverId="menu" />);

    pathname = "/png-para-webp";
    rerender(<ClosePopoverOnNavigate popoverId="menu" />);

    expect(hidePopover).toHaveBeenCalledOnce();
  });
});
