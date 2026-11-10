import { Download, FileImage, Settings, Trash2, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdSlot } from "@/components/ads/ad-slot";
import { ToolCard } from "@/components/tools/tool-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/cn";
import type { Tool } from "@/lib/tools";

/*
 * Referência visual dos tokens e componentes base.
 * Só existe em desenvolvimento: no build de produção responde 404.
 */

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

type Swatch = { token: string; className: string; description: string };

// Classes completas (o Tailwind só gera o que encontra escrito no código).
const colorGroups: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Superfícies",
    swatches: [
      {
        token: "background",
        className: "bg-background",
        description: "Fundo da página",
      },
      {
        token: "surface",
        className: "bg-surface",
        description: "Cards e painéis",
      },
      {
        token: "surface-muted",
        className: "bg-surface-muted",
        description: "Áreas secundárias e hover",
      },
    ],
  },
  {
    title: "Texto e bordas",
    swatches: [
      {
        token: "foreground",
        className: "bg-foreground",
        description: "Texto principal",
      },
      {
        token: "muted",
        className: "bg-muted",
        description: "Texto secundário",
      },
      {
        token: "line",
        className: "bg-line",
        description: "Divisórias",
      },
      {
        token: "line-strong",
        className: "bg-line-strong",
        description: "Bordas de controles",
      },
    ],
  },
  {
    title: "Ação principal",
    swatches: [
      {
        token: "primary",
        className: "bg-primary",
        description: "Botão principal e links",
      },
      {
        token: "primary-hover",
        className: "bg-primary-hover",
        description: "Hover do principal",
      },
      {
        token: "on-primary",
        className: "bg-on-primary",
        description: "Texto sobre o principal",
      },
      {
        token: "ring",
        className: "bg-ring",
        description: "Contorno de foco",
      },
    ],
  },
  {
    title: "Estados",
    swatches: [
      { token: "info", className: "bg-info", description: "Informação" },
      {
        token: "info-soft",
        className: "bg-info-soft",
        description: "Fundo de informação",
      },
      { token: "success", className: "bg-success", description: "Sucesso" },
      {
        token: "success-soft",
        className: "bg-success-soft",
        description: "Fundo de sucesso",
      },
      { token: "danger", className: "bg-danger", description: "Erro" },
      {
        token: "danger-soft",
        className: "bg-danger-soft",
        description: "Fundo de erro",
      },
    ],
  },
];

const exampleTool: Tool = {
  slug: "exemplo-disponivel",
  name: "Ferramenta disponível",
  shortDescription: "Exemplo de card com link, como fica depois de publicada.",
  icon: FileImage,
  category: "convert",
  transformation: { from: ["PNG", "JPG"], to: ["WebP"] },
  status: "available",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={2}>{title}</Heading>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-14">
      <header className="flex flex-col gap-2">
        <Badge variant="info" className="self-start">
          Só em desenvolvimento
        </Badge>
        <Heading level={1}>Styleguide</Heading>
        <p className="max-w-prose text-muted">
          Tokens semânticos e componentes base. A paleta é neutra e provisória:
          quando a identidade visual for definida, só os valores em{" "}
          <code className="font-mono text-sm">globals.css</code> mudam.
        </p>
      </header>

      <Section title="Cores">
        {colorGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <Heading level={3}>{group.title}</Heading>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {group.swatches.map((swatch) => (
                <li key={swatch.token} className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "h-16 rounded-control border border-line",
                      swatch.className,
                    )}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <p className="font-mono font-medium">{swatch.token}</p>
                    <p className="text-muted">{swatch.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Raios e sombras">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-control border border-line bg-surface p-4 shadow-card">
            <p className="font-mono text-sm">rounded-control · shadow-card</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-4 shadow-raised">
            <p className="font-mono text-sm">rounded-card · shadow-raised</p>
          </div>
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="flex flex-col gap-3">
          <Heading level={3} size="xl">
            Heading xl: Converter imagem para WebP
          </Heading>
          <Heading level={3} size="lg">
            Heading lg: Como usar
          </Heading>
          <Heading level={3} size="md">
            Heading md: Perguntas frequentes
          </Heading>
          <p>
            Texto padrão: seus arquivos são processados no navegador e nunca
            saem do seu dispositivo.
          </p>
          <p className="text-muted">
            Texto secundário: tamanho original 2,4 MB, convertido 812 KB.
          </p>
          <p className="text-sm text-muted tabular-nums">
            Números tabulares: 1920 × 1080 · 812 KB · 66%
          </p>
        </div>
      </Section>

      <Section title="Button">
        <Row>
          <Button>Converter</Button>
          <Button variant="secondary">Escolher outra imagem</Button>
          <Button variant="ghost">Cancelar</Button>
        </Row>
        <Row>
          <Button size="lg">
            <Download className="size-5" aria-hidden="true" />
            Baixar WebP
          </Button>
          <Button loading>Convertendo</Button>
          <Button disabled>Indisponível</Button>
          <Button href="/" variant="secondary">
            Link com visual de botão
          </Button>
        </Row>
      </Section>

      <Section title="IconButton">
        <Row>
          <IconButton aria-label="Fechar">
            <X />
          </IconButton>
          <IconButton aria-label="Configurações" variant="secondary">
            <Settings />
          </IconButton>
          <IconButton aria-label="Remover arquivo" variant="secondary">
            <Trash2 />
          </IconButton>
        </Row>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card as="article" className="flex flex-col gap-2">
            <Heading level={3}>Converter para WebP</Heading>
            <p className="text-muted">
              Transforme PNG e JPG em WebP, mais leve para a web.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <Heading level={3}>Resultado</Heading>
            <Row>
              <Badge>PNG</Badge>
              <Badge variant="info">WebP</Badge>
              <Badge variant="success">-66%</Badge>
              <Badge variant="danger">Erro</Badge>
            </Row>
          </Card>
        </div>
      </Section>

      <Section title="Alert">
        <div className="flex flex-col gap-3">
          <Alert title="Privacidade">
            A imagem é processada no seu navegador. Os metadados (inclusive a
            localização) são removidos na conversão.
          </Alert>
          <Alert variant="success" title="Imagem convertida">
            Seu arquivo ficou 66% menor.
          </Alert>
          <Alert variant="error" title="Arquivo muito grande">
            Escolha uma imagem de até 20 MB.
          </Alert>
        </div>
      </Section>

      <Section title="Spinner e ProgressBar">
        <Row>
          <Spinner size="sm" />
          <Spinner label="Carregando" />
          <Spinner size="lg" />
        </Row>
        <div className="flex max-w-md flex-col gap-4">
          <ProgressBar value={35} label="Progresso da conversão" showValue />
          <ProgressBar value={100} label="Conversão concluída" />
        </div>
      </Section>

      <Section title="ToolCard">
        <ul className="grid gap-4 sm:grid-cols-2">
          <li>
            <ToolCard tool={exampleTool} />
          </li>
          <li>
            <ToolCard
              tool={{
                ...exampleTool,
                slug: "exemplo-em-breve",
                name: "Ferramenta em breve",
                shortDescription:
                  "Sem link e com o badge até a fase dela terminar.",
                status: "soon",
              }}
            />
          </li>
          <li className="sm:col-span-2">
            <ToolCard
              tool={{
                ...exampleTool,
                slug: "exemplo-destaque",
                name: "Ferramenta em destaque",
                shortDescription:
                  "Card maior, com a textura de xadrez à direita.",
                featured: true,
              }}
            />
          </li>
        </ul>
      </Section>

      <Section title="AdSlot">
        <p className="text-muted">
          Sem{" "}
          <code className="font-mono text-sm">
            NEXT_PUBLIC_ADSENSE_CLIENT_ID
          </code>
          , aparece só em desenvolvimento, com contorno. A lateral só aparece a
          partir de <code className="font-mono text-sm">lg</code>.
        </p>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18.75rem]">
          <div className="flex flex-col gap-4">
            <AdSlot position="below-tool" />
            <AdSlot position="in-content" />
          </div>
          <AdSlot position="sidebar" />
        </div>
      </Section>

      <Section title="ToolPageLayout">
        <p>
          O esqueleto das páginas de ferramenta tem o próprio h1, por isso fica
          numa página separada:{" "}
          <Button href="/styleguide/ferramenta" variant="secondary">
            Ver exemplo de página de ferramenta
          </Button>
        </p>
      </Section>

      <Section title="VisuallyHidden">
        <p>
          Este parágrafo tem um texto oculto só para leitores de tela.
          <VisuallyHidden>
            {" "}
            Texto lido apenas pelo leitor de tela.
          </VisuallyHidden>
        </p>
      </Section>
    </Container>
  );
}
