import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { FaqList } from "@/components/tools/faq-list";
import { ImageCropper } from "@/components/tools/image-cropper";
import {
  ToolPageLayout,
  ToolPageSection,
} from "@/components/tools/tool-page-layout";
import { createToolMetadata } from "@/lib/seo";
import { faqPageJsonLd, webApplicationJsonLd } from "@/lib/structured-data";
import { requireTool } from "@/lib/tools";

import { content, faq } from "./content";

const tool = requireTool("cortador-de-imagem");

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
        tool={<ImageCropper />}
      >
        <ToolPageSection title="Como cortar">
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Toque em &quot;Escolher imagem&quot; e selecione o JPG, PNG ou
              WebP (no computador, também dá para arrastar o arquivo para a
              página).
            </li>
            <li>
              Escolha a proporção e arraste a seleção ou as bordas dela. Se
              precisar, gire a imagem e digite a largura e a altura finais.
            </li>
            <li>
              Toque em &quot;Cortar imagem&quot;, confira a prévia e toque no
              ícone de download para salvar.
            </li>
          </ol>
        </ToolPageSection>
        <ToolPageSection title="Tamanhos para redes sociais">
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <strong>Feed do Instagram:</strong> 1080 × 1080 (1:1) ou 1080 ×
              1350 (4:5), que ocupa mais espaço na tela do celular.
            </li>
            <li>
              <strong>Stories, Reels e TikTok:</strong> 1080 × 1920 (9:16).
            </li>
            <li>
              <strong>Capa de vídeo do YouTube:</strong> 1280 × 720 (16:9).
            </li>
            <li>
              <strong>Foto de perfil:</strong> quadrada (1:1). A maioria das
              redes mostra em círculo, então deixe o rosto no centro.
            </li>
          </ul>
          <p>
            As redes sociais costumam comprimir as imagens de novo ao publicar.
            Enviar já no tamanho certo evita cortes inesperados.
          </p>
        </ToolPageSection>
        <ToolPageSection title="Perguntas frequentes">
          <FaqList items={faq} />
        </ToolPageSection>
        <ToolPageSection title="Privacidade">
          <p>
            O corte acontece inteiro no seu navegador: a imagem não é enviada
            para nenhum servidor, nem guardada pelo site. Quando você fecha a
            página, ela some da memória.
          </p>
          <p>
            O arquivo cortado sai sem os metadados da original (como a
            localização e o modelo da câmera). Para deixar o arquivo mais leve
            depois de cortar, use o{" "}
            <Link href="/compactar-imagem" className={linkClass}>
              compactador de imagens
            </Link>
            .
          </p>
        </ToolPageSection>
      </ToolPageLayout>
    </>
  );
}
