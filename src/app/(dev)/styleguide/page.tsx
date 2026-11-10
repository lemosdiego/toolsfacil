import { Download, Settings, Trash2, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ToolsMenu } from "@/components/layout/tools-menu";
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

      <Section title="Menu de ferramentas">
        <p className="max-w-prose text-muted">
          Conteúdo do menu do header (
          <code className="font-mono text-sm">ToolsMenu</code>), lido do
          registro. Abre ao passar o mouse no botão &quot;Ferramentas&quot; e,
          no toque ou no teclado, pelo clique. Uma coluna no celular, duas no
          tablet e três no desktop.
        </p>
        <div className="rounded-card border border-line bg-surface p-5 shadow-raised sm:p-8">
          <ToolsMenu />
        </div>
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
