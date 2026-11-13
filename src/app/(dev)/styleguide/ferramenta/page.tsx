import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ToolPageLayout,
  ToolPageSection,
} from "@/components/tools/tool-page-layout";

import { ExampleTool } from "./example-tool";

/* Exemplo vivo do molde das páginas de ferramenta, só em dev (404 em produção). */

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
      title="Regravar imagem em PNG"
      description="Exemplo do molde com o fluxo real das ferramentas: escolha ou arraste uma imagem PNG, JPG ou WebP, e ela é regravada em PNG no seu navegador."
      tool={<ExampleTool />}
    >
      <ToolPageSection title="Como usar">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>Toque em &quot;Escolher imagem&quot; e selecione o arquivo.</li>
          <li>Confira a prévia e o tamanho antes e depois.</li>
          <li>Toque no ícone de download para salvar.</li>
        </ol>
      </ToolPageSection>
      <ToolPageSection title="Perguntas frequentes">
        <details className="rounded-control border border-line bg-surface p-4">
          <summary className="cursor-pointer font-medium">
            Preciso criar uma conta?
          </summary>
          <p className="mt-2 text-muted">
            Não. As perguntas e respostas de cada ferramenta entram aqui.
          </p>
        </details>
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
