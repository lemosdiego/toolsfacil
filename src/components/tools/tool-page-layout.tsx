import { Children, type ReactNode } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/cn";

type ToolPageLayoutProps = {
  /** h1 da página, com a palavra-chave principal (ex.: "PNG para WebP"). */
  title: string;
  /** Texto curto (2 ou 3 linhas) logo abaixo do h1. */
  description: ReactNode;
  /**
   * A ilha "use client" da ferramenta. Ela renderiza um `ToolActionArea`
   * (botão de escolher a imagem) e um `ToolPreviewArea` (PreviewCard), que
   * se encaixam na grade: à esquerda e à direita no desktop.
   */
  tool: ReactNode;
  /**
   * Texto da página em `ToolPageSection`s (como usar, FAQ, privacidade).
   * O anúncio `in-content` entra depois da primeira seção.
   */
  children: ReactNode;
};

/**
 * Molde das páginas de ferramenta:
 *
 * - Desktop: título, texto e botão à esquerda; prévia à direita.
 * - Celular: uma coluna (título → texto → botão → prévia), com título e
 *   botão acima da dobra.
 * - Antes da ferramenta: anúncio `top`, só no desktop.
 * - Depois da ferramenta: espaço de segurança → anúncio `below-tool` → texto,
 *   com o anúncio `in-content` no meio e o `sidebar` sticky (só desktop).
 */
export function ToolPageLayout({
  title,
  description,
  tool,
  children,
}: ToolPageLayoutProps) {
  const sections = Children.toArray(children);
  const [firstSection, ...otherSections] = sections;

  return (
    <Container className="flex flex-col py-6 sm:py-10">
      {/*
       * Anúncio do topo, só no desktop: no celular empurraria o botão para
       * baixo da dobra. Fica a 48px da ferramenta (a prévia, com o ícone de
       * download, começa no topo da grade).
       */}
      <div className="hidden lg:mb-12 lg:block">
        <AdSlot position="top" />
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
        <header className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1 lg:self-end">
          <Heading level={1}>{title}</Heading>
          <p className="max-w-prose text-base text-muted sm:text-lg">
            {description}
          </p>
        </header>

        {/* As áreas da ilha viram itens desta grade. */}
        <div className="contents" data-tool-area>
          {tool}
        </div>
      </div>

      {/*
       * Espaço de segurança entre a ferramenta e o anúncio (política do
       * AdSense): margem grande e divisória, para nunca ficar colado ao botão
       * de escolher a imagem nem ao ícone de download.
       */}
      <div className="mt-12 border-t border-line pt-8 sm:mt-16">
        <AdSlot position="below-tool" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18.75rem]">
        <div className="flex min-w-0 flex-col gap-10">
          {firstSection}
          {otherSections.length > 0 && (
            <>
              <AdSlot position="in-content" />
              {otherSections}
            </>
          )}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <AdSlot position="sidebar" />
          </div>
        </div>
      </div>
    </Container>
  );
}

/** Área do botão de escolher a imagem: abaixo do texto, à esquerda. */
export function ToolActionArea({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:self-start">
      {children}
    </div>
  );
}

type ToolPreviewAreaProps = {
  children: ReactNode;
  /**
   * No celular, esconde a prévia enquanto não há imagem, para o botão ficar
   * acima da dobra. No desktop ela sempre aparece.
   */
  hiddenOnMobile?: boolean;
};

/** Área da prévia: à direita no desktop, abaixo do botão no celular. */
export function ToolPreviewArea({
  children,
  hiddenOnMobile = false,
}: ToolPreviewAreaProps) {
  return (
    <div
      className={cn(
        "lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center",
        hiddenOnMobile && "hidden lg:block",
      )}
    >
      {children}
    </div>
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
    <section id={id} className="flex max-w-prose scroll-mt-28 flex-col gap-3">
      <Heading level={2}>{title}</Heading>
      <div className="flex flex-col gap-3 text-foreground">{children}</div>
    </section>
  );
}
