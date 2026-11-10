import { Menu, Wrench, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IconButton } from "@/components/ui/icon-button";
import { siteConfig } from "@/lib/site-config";
import { getToolsForDisplay } from "@/lib/tools";

import { ClosePopoverOnNavigate } from "./close-popover-on-navigate";
import { ToolMenuItem } from "./tool-menu-item";

export const TOOLS_MENU_ID = "menu-ferramentas";

export function SiteHeader() {
  return (
    <header className="z-40 border-b border-line bg-background lg:sticky lg:top-0">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-control text-lg font-semibold tracking-tight"
        >
          {/* Marca provisória até a identidade visual (fase 12). */}
          <span
            className="grid size-8 place-items-center rounded-control bg-primary text-on-primary"
            aria-hidden="true"
          >
            <Wrench className="size-4" />
          </span>
          {siteConfig.name}
        </Link>

        {/* Popover API nativa: Esc e clique fora fecham sem JavaScript próprio. */}
        <Button variant="secondary" popoverTarget={TOOLS_MENU_ID}>
          <Menu className="size-4" aria-hidden="true" />
          Ferramentas
        </Button>
      </Container>

      <div
        id={TOOLS_MENU_ID}
        popover="auto"
        className="fixed inset-auto top-[4.5rem] right-4 left-4 m-0 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-card border border-line bg-surface p-2 text-foreground shadow-raised backdrop:bg-foreground/20 sm:left-auto sm:w-96 lg:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      >
        <div className="flex items-center justify-between gap-2 pl-3">
          <p className="text-sm font-medium text-muted">Ferramentas</p>
          <IconButton
            aria-label="Fechar menu"
            popoverTarget={TOOLS_MENU_ID}
            popoverTargetAction="hide"
          >
            <X />
          </IconButton>
        </div>
        <nav aria-label="Ferramentas">
          <ul className="flex flex-col gap-1">
            {getToolsForDisplay().map((tool) => (
              <li key={tool.slug}>
                <ToolMenuItem tool={tool} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <ClosePopoverOnNavigate popoverId={TOOLS_MENU_ID} />
    </header>
  );
}
