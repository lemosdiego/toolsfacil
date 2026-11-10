import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

import { ClosePopoverOnNavigate } from "./close-popover-on-navigate";
import { OpenPopoverOnHover } from "./open-popover-on-hover";
import { ToolsMenu } from "./tools-menu";

export const TOOLS_MENU_ID = "menu-ferramentas";

export const TOOLS_MENU_TRIGGER_ID = "botao-ferramentas";

/*
 * Header e painel ocupam a largura toda da tela, com a margem lateral do site
 * (1rem no celular, 1.5rem a partir de sm). No celular o painel é absolute
 * (rola junto com o header, que não é fixo); a partir de lg, fixed, como o
 * header sticky.
 */
const panelClasses = [
  "absolute top-[5.25rem] bottom-auto m-0 h-auto w-auto p-0 lg:fixed",
  "inset-x-4 sm:inset-x-6",
  "max-h-[calc(100dvh_-_6rem)] overflow-y-auto overscroll-contain",
  "rounded-card border border-line bg-surface text-foreground shadow-raised",
].join(" ");

export function SiteHeader() {
  return (
    <header className="group z-40 bg-background pt-3 lg:sticky lg:top-0">
      <div className="px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 shadow-card sm:px-5">
          {/* Logo provisório em texto até a identidade visual (fase 14). */}
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-0 items-center rounded-control px-1 text-lg font-semibold tracking-tight"
          >
            <span className="truncate">{siteConfig.name}</span>
          </Link>

          {/*
           * Popover API nativa: toque e teclado abrem pelo botão; Esc, clique
           * fora e aria-expanded vêm do navegador. Com o mouse, abre no hover.
           */}
          <Button
            id={TOOLS_MENU_TRIGGER_ID}
            variant="secondary"
            popoverTarget={TOOLS_MENU_ID}
          >
            Ferramentas
            <ChevronDown
              className="size-4 group-has-[:popover-open]:rotate-180 motion-safe:transition-transform"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      <div
        id={TOOLS_MENU_ID}
        popover="auto"
        data-scroll-lock-mobile=""
        className={panelClasses}
      >
        <div className="p-3 sm:p-5">
          <ToolsMenu />
        </div>
      </div>
      <OpenPopoverOnHover
        popoverId={TOOLS_MENU_ID}
        triggerId={TOOLS_MENU_TRIGGER_ID}
      />
      <ClosePopoverOnNavigate popoverId={TOOLS_MENU_ID} />
    </header>
  );
}
