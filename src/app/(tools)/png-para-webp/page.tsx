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

const tool = requireTool("png-para-webp");

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
              Toque em &quot;Escolher imagem&quot; e selecione o PNG (no
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
        <ToolPageSection title="Por que converter PNG para WebP?">
          <p>
            O WebP é um formato de imagem criado para a web. Na maioria das
            imagens, ele fica bem menor que o PNG equivalente, e isso deixa
            sites mais rápidos e economiza dados no celular.
          </p>
          <p>
            Diferente do JPG, o WebP aceita transparência: logos, ícones e
            recortes continuam com o fundo transparente depois da conversão.
          </p>
          <p>
            Todos os navegadores atuais (Chrome, Edge, Firefox e Safari) abrem
            imagens WebP.
          </p>
          <p>
            Tem uma foto em JPG? Esta página também converte, e a página{" "}
            <Link
              href="/jpg-para-webp"
              className="font-medium underline underline-offset-4"
            >
              JPG para WebP
            </Link>{" "}
            traz dicas para fotos.
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
