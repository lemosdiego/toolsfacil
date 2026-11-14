import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { FaqList } from "@/components/tools/faq-list";
import { ImageCompressor } from "@/components/tools/image-compressor";
import {
  ToolPageLayout,
  ToolPageSection,
} from "@/components/tools/tool-page-layout";
import { createToolMetadata } from "@/lib/seo";
import { faqPageJsonLd, webApplicationJsonLd } from "@/lib/structured-data";
import { requireTool } from "@/lib/tools";

import { content, faq } from "./content";

const tool = requireTool("compactar-imagem");

const linkClass = "font-medium underline underline-offset-4";

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
        tool={<ImageCompressor />}
      >
        <ToolPageSection title="Como compactar">
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Toque em &quot;Escolher imagem&quot; e selecione o JPG, PNG ou
              WebP (no computador, também dá para arrastar o arquivo para a
              página).
            </li>
            <li>
              Escolha como compactar: pela <strong>qualidade</strong> (75 já
              reduz bastante sem diferença visível) ou por um{" "}
              <strong>tamanho máximo</strong>, como 100 KB.
            </li>
            <li>
              Confira a prévia e o tamanho antes e depois, e toque no ícone de
              download para salvar a imagem compactada.
            </li>
          </ol>
        </ToolPageSection>
        <ToolPageSection title="Dicas para reduzir mais">
          <p>
            <strong>Formulários com limite de tamanho:</strong> inscrições,
            concursos e cadastros costumam pedir fotos de até 100 KB ou 200 KB.
            O modo &quot;Tamanho máximo&quot; acha sozinho a melhor qualidade
            que cabe no limite.
          </p>
          <p>
            <strong>Foto grande demais:</strong> uma foto de celular tem milhões
            de pixels. Se nem a qualidade mínima couber no limite, diminuir a
            largura e a altura reduz muito mais que a compactação.
          </p>
          <p>
            <strong>PNG:</strong> a compactação do PNG é sem perdas, então o
            ganho é menor. Para logos, prints e recortes que vão para um site, o{" "}
            <Link href="/png-para-webp" className={linkClass}>
              conversor de PNG para WebP
            </Link>{" "}
            deixa o arquivo bem menor e mantém a transparência.
          </p>
          <p>
            <strong>Metadados:</strong> fotos de celular guardam dados como o
            modelo da câmera e a localização, que podem ocupar dezenas de KB. A
            compactação remove tudo isso.
          </p>
        </ToolPageSection>
        <ToolPageSection title="Perguntas frequentes">
          <FaqList items={faq} />
        </ToolPageSection>
        <ToolPageSection title="Privacidade">
          <p>
            A compactação acontece inteira no seu navegador: a imagem não é
            enviada para nenhum servidor, nem guardada pelo site. Quando você
            fecha a página, ela some da memória.
          </p>
          <p>
            O arquivo compactado sai sem os metadados da original (como a
            localização e o modelo da câmera).
          </p>
        </ToolPageSection>
      </ToolPageLayout>
    </>
  );
}
