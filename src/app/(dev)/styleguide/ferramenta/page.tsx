import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ToolPageLayout,
  ToolPageSection,
} from "@/components/tools/tool-page-layout";

/* Exemplo do ToolPageLayout, só em desenvolvimento (404 em produção). */

export const metadata: Metadata = {
  title: "Exemplo de página de ferramenta",
  robots: { index: false, follow: false },
};

export default function ToolLayoutExamplePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <ToolPageLayout
      title="Converter imagem para WebP"
      description="Exemplo do esqueleto das páginas de ferramenta, com as posições de anúncio."
      tool={
        <div
          data-testid="tool-placeholder"
          className="grid min-h-64 place-items-center rounded-card border-2 border-dashed border-line-strong bg-surface p-6 text-center text-muted"
        >
          Área da ferramenta (área de soltar arquivo na fase 05)
        </div>
      }
    >
      <ToolPageSection title="Como usar">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Escolha a imagem.</li>
          <li>Ajuste as opções.</li>
          <li>Baixe o resultado.</li>
        </ol>
      </ToolPageSection>
      <ToolPageSection title="Perguntas frequentes">
        <p>As perguntas e respostas de cada ferramenta entram aqui.</p>
      </ToolPageSection>
      <ToolPageSection title="Privacidade">
        <p>
          A imagem é processada no seu navegador e nunca é enviada para nenhum
          servidor.
        </p>
      </ToolPageSection>
    </ToolPageLayout>
  );
}
