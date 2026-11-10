import type { ReactNode } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";

type ToolPageLayoutProps = {
  /** h1 da página, com a palavra-chave principal (ex.: "Converter imagem para WebP"). */
  title: string;
  /** Subtítulo curto, logo abaixo do h1. */
  description: ReactNode;
  /** A parte interativa da ferramenta (ilha "use client"). */
  tool: ReactNode;
  /** Texto da página (Server Components): como usar, FAQ, privacidade. */
  children: ReactNode;
};

/**
 * Esqueleto das páginas de ferramenta:
 * cabeçalho → ferramenta (acima da dobra) → espaço de segurança → anúncio
 * → texto, com anúncio lateral sticky só no desktop.
 */
export function ToolPageLayout({
  title,
  description,
  tool,
  children,
}: ToolPageLayoutProps) {
  return (
    <Container className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-10">
      <header className="flex max-w-prose flex-col gap-2">
        <Heading level={1}>{title}</Heading>
        <p className="text-lg text-muted">{description}</p>
      </header>

      <section aria-label="Ferramenta" data-tool-area>
        {tool}
      </section>

      {/*
       * Espaço de segurança entre a ferramenta e o anúncio (política do
       * AdSense): margem extra e divisória, para nunca ficar colado ao botão
       * de download ou à área de soltar arquivo.
       */}
      <div className="mt-4 border-t border-line pt-8 sm:mt-8">
        <AdSlot position="below-tool" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18.75rem]">
        <div className="flex min-w-0 flex-col gap-10">{children}</div>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <AdSlot position="sidebar" />
          </div>
        </div>
      </div>
    </Container>
  );
}

type ToolPageSectionProps = {
  title: string;
  children: ReactNode;
  id?: string;
};

/** Seção de texto da página de ferramenta, com título h2. */
export function ToolPageSection({ title, children, id }: ToolPageSectionProps) {
  return (
    <section id={id} className="flex max-w-prose scroll-mt-24 flex-col gap-3">
      <Heading level={2}>{title}</Heading>
      <div className="flex flex-col gap-3 text-foreground">{children}</div>
    </section>
  );
}
