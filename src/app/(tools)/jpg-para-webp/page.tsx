import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { FaqList } from "@/components/tools/faq-list";
import {
  ToolPageLayout,
  ToolPageSection,
} from "@/components/tools/tool-page-layout";
import { WebpConverter } from "@/components/tools/webp-converter";
import { createToolMetadata } from "@/lib/seo";
import { faqPageJsonLd, webApplicationJsonLd } from "@/lib/structured-data";
import { requireTool } from "@/lib/tools";

import { content, faq } from "./content";

const tool = requireTool("jpg-para-webp");

export const metadata = createToolMetadata(tool, {
  title: content.title,
  description: content.metaDescription,
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webApplicationJsonLd(tool, {
            name: content.h1,
            description: content.metaDescription,
          }),
          faqPageJsonLd(faq),
        ]}
      />
      <ToolPageLayout
        title={content.h1}
        description={content.intro}
        tool={<WebpConverter />}
      >
        <ToolPageSection title="Como usar">
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Toque em &quot;Escolher imagem&quot; e selecione a foto JPG (no
              computador, também dá para arrastar o arquivo para a página).
            </li>
            <li>
              Ajuste a qualidade, se quiser: 80 já deixa o arquivo bem menor sem
              diferença visível.
            </li>
            <li>
              Confira a prévia e o tamanho antes e depois, e toque no ícone de
              download para salvar o arquivo .webp.
            </li>
          </ol>
        </ToolPageSection>
        <ToolPageSection title="Por que converter JPG para WebP?">
          <p>
            O WebP é um formato de imagem criado para a web. Com a mesma
            aparência, uma foto em WebP costuma ser bem menor que em JPG, e
            páginas mais leves carregam mais rápido, principalmente no celular.
          </p>
          <p>
            Para lojas virtuais e blogs, isso significa vitrines e posts que
            abrem antes, o que ajuda quem visita e também o posicionamento no
            Google.
          </p>
          <p>
            Todos os navegadores atuais (Chrome, Edge, Firefox e Safari) abrem
            imagens WebP.
          </p>
          <p>
            Precisa manter um fundo transparente? Use a página{" "}
            <Link
              href="/png-para-webp"
              className="font-medium underline underline-offset-4"
            >
              PNG para WebP
            </Link>
            , que explica como a transparência é preservada.
          </p>
        </ToolPageSection>
        <ToolPageSection title="Perguntas frequentes">
          <FaqList items={faq} />
        </ToolPageSection>
        <ToolPageSection title="Privacidade">
          <p>
            A conversão acontece inteira no seu navegador: a imagem não é
            enviada para nenhum servidor, nem guardada pelo site. Quando você
            fecha a página, ela some da memória.
          </p>
          <p>
            O arquivo convertido sai sem os metadados da original (como a
            localização e o modelo da câmera).
          </p>
        </ToolPageSection>
      </ToolPageLayout>
    </>
  );
}
