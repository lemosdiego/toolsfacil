import {
  ChevronDown,
  Download,
  ImagePlus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";

import { AdSlot } from "@/components/ads/ad-slot";
import { ToolGrid } from "@/components/tools/tool-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import {
  categoryLabels,
  getToolsForDisplay,
  type Tool,
  type ToolCategory,
} from "@/lib/tools";

const trustItems: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "Processado no seu navegador" },
  { icon: UserRoundX, label: "Sem cadastro" },
  { icon: Sparkles, label: "Grátis" },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ImagePlus,
    title: "Escolha a imagem",
    text: "Arraste o arquivo para a página ou toque para abrir a galeria ou a câmera do celular.",
  },
  {
    icon: SlidersHorizontal,
    title: "Ajuste",
    text: "Escolha o formato, a qualidade ou o corte. A prévia aparece na hora.",
  },
  {
    icon: Download,
    title: "Baixe",
    text: "O resultado fica pronto em segundos, com o tamanho antes e depois para você comparar.",
  },
];

const faq: { question: string; answer: string }[] = [
  {
    question: "As ferramentas são gratuitas?",
    answer:
      "Sim. Todas as ferramentas são gratuitas e não pedem cadastro. O site é mantido por anúncios, que nunca ficam no meio da ferramenta.",
  },
  {
    question: "Minhas imagens são enviadas para algum servidor?",
    answer:
      "Não. A conversão, o corte e a compactação acontecem no próprio navegador, no seu computador ou celular. O arquivo não é enviado, guardado nem visto por ninguém.",
  },
  {
    question: "O que acontece com os dados da foto, como a localização?",
    answer:
      "A imagem gerada é regravada do zero, sem os metadados da original (EXIF), o que inclui a localização GPS que muitos celulares salvam na foto.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim. O site foi pensado primeiro para o celular: você escolhe a foto da galeria ou tira na hora, e baixa o resultado no próprio aparelho.",
  },
  {
    question: "Quais formatos posso usar?",
    answer:
      "PNG, JPG, WebP e HEIC (o formato das fotos do iPhone), conforme a ferramenta. Cada página explica o que entra e o que sai.",
  },
];

/** Primeira ferramenta de cada categoria: destino dos atalhos por intenção. */
function getIntentShortcuts(tools: Tool[]) {
  const seen = new Set<ToolCategory>();
  const shortcuts: { label: string; slug: string }[] = [];

  for (const tool of tools) {
    if (seen.has(tool.category)) continue;
    seen.add(tool.category);
    shortcuts.push({ label: categoryLabels[tool.category], slug: tool.slug });
  }

  return shortcuts;
}

export default function Home() {
  const tools = getToolsForDisplay();
  const shortcuts = getIntentShortcuts(tools);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 bg-checkerboard [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)] opacity-50"
          aria-hidden="true"
        />
        <Container className="relative flex flex-col items-start gap-6 py-10 sm:py-16">
          <Heading level={1} className="max-w-3xl">
            Ferramentas de imagem online, grátis e sem enviar seus arquivos
          </Heading>
          <p className="max-w-prose text-lg text-muted">
            Converta, corte e compacte imagens em segundos. Tudo acontece no seu
            navegador: suas fotos nunca saem do seu dispositivo.
          </p>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5">
                <Icon className="size-4 text-success" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <nav
            aria-label="O que você quer fazer?"
            className="flex flex-col gap-2"
          >
            <p className="text-sm text-muted">O que você quer fazer?</p>
            <ul className="flex flex-wrap gap-2">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.slug}>
                  <Button
                    href={`#${shortcut.slug}`}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {shortcut.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <Container
        as="section"
        aria-labelledby="ferramentas"
        className="flex flex-col gap-6 py-12"
      >
        <div className="flex flex-col gap-2">
          <Heading level={2} id="ferramentas">
            Escolha uma ferramenta
          </Heading>
          <p className="text-muted">
            Cada uma resolve uma tarefa, do jeito mais rápido possível.
          </p>
        </div>
        <ToolGrid tools={tools} />
      </Container>

      <Container>
        <AdSlot position="in-content" />
      </Container>

      <Container
        as="section"
        aria-labelledby="como-funciona"
        className="flex flex-col gap-6 py-12"
      >
        <Heading level={2} id="como-funciona">
          Como funciona
        </Heading>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-on-primary tabular-nums"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <Heading level={3}>{title}</Heading>
                <p className="text-muted">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>

      <Container as="section" aria-labelledby="confira" className="py-12">
        <Card className="relative flex flex-col gap-4 overflow-hidden sm:p-8">
          <div
            className="absolute inset-y-0 right-0 w-1/2 bg-checkerboard [mask-image:linear-gradient(to_left,black,transparent)] opacity-40"
            aria-hidden="true"
          />
          <div className="relative flex max-w-prose flex-col gap-4">
            <ShieldCheck className="size-8 text-success" aria-hidden="true" />
            <Heading level={2} id="confira">
              Não precisa confiar: confira você mesmo
            </Heading>
            <p>
              Muitos sites de imagem enviam o seu arquivo para um servidor e
              prometem apagá-lo depois. Aqui ele nem sai do seu aparelho, e dá
              para comprovar em um minuto:
            </p>
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              <li>
                Abra as ferramentas do desenvolvedor do navegador (
                <kbd className="font-mono text-sm">F12</kbd> no computador).
              </li>
              <li>
                Vá até a aba <strong>Rede</strong> (Network).
              </li>
              <li>
                Use qualquer ferramenta: nenhuma requisição leva a sua imagem.
              </li>
            </ol>
          </div>
        </Card>
      </Container>

      <Container
        as="section"
        aria-labelledby="perguntas-frequentes"
        width="prose"
        className="flex flex-col gap-6 py-12"
      >
        <Heading level={2} id="perguntas-frequentes">
          Perguntas frequentes
        </Heading>
        <div className="flex flex-col gap-3">
          {faq.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-control border border-line bg-surface"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-4 pb-4 text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
