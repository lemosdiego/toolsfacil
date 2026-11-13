import { AdSlot } from "@/components/ads/ad-slot";
import { ImageRouter } from "@/components/home/image-router";
import { ToolGrid } from "@/components/home/tool-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqList } from "@/components/tools/faq-list";
import { ToolPageSection } from "@/components/tools/tool-page-layout";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { faqPageJsonLd, webSiteJsonLd } from "@/lib/structured-data";

import { homeFaq, homeIntro } from "./home-content";

export const metadata = createPageMetadata({
  title: `${siteConfig.name}: ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

/**
 * Home enxuta: a pessoa chega e já escolhe a imagem (o roteador sugere as
 * ferramentas que servem para ela). Depois, a grade com todas as
 * ferramentas, o anúncio (longe da área de escolher) e o texto.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={[webSiteJsonLd(), faqPageJsonLd(homeFaq)]} />
      <Container className="flex flex-col py-6 sm:py-10">
        <header className="flex flex-col gap-3">
          <Heading level={1}>{siteConfig.tagline}</Heading>
          <p className="max-w-prose text-base text-muted sm:text-lg">
            {homeIntro}
          </p>
        </header>

        <div className="mt-6">
          <ImageRouter />
        </div>

        <section
          aria-labelledby="todas-as-ferramentas"
          className="mt-12 flex flex-col gap-6"
        >
          <Heading level={2} id="todas-as-ferramentas">
            Todas as ferramentas
          </Heading>
          <ToolGrid />
        </section>

        {/*
         * Espaço de segurança (política do AdSense): o anúncio fica depois da
         * grade, longe da área de escolher a imagem e das ações.
         */}
        <div className="mt-12 border-t border-line pt-8 sm:mt-16">
          <AdSlot position="below-tool" />
        </div>

        <div className="mt-10 flex flex-col gap-10">
          <ToolPageSection title="Como funciona">
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              <li>
                Escolha uma imagem (no computador, também dá para arrastar).
              </li>
              <li>Veja as ferramentas que servem para ela e escolha uma.</li>
              <li>Ajuste, confira a prévia e baixe o resultado.</li>
            </ol>
          </ToolPageSection>
          <ToolPageSection title="Privacidade">
            <p>
              As ferramentas funcionam inteiras no seu navegador: as imagens não
              são enviadas para nenhum servidor, nem guardadas pelo site. O
              arquivo pronto sai sem os metadados da original, como a
              localização da foto.
            </p>
          </ToolPageSection>
          <ToolPageSection title="Perguntas frequentes">
            <FaqList items={homeFaq} />
          </ToolPageSection>
        </div>
      </Container>
    </>
  );
}
