import type { Metadata } from "next";

import { ToolMenuItem } from "@/components/layout/tool-menu-item";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { tools } from "@/lib/tools";

// O Next já marca a 404 com `noindex`: aqui só o título da aba.
export const metadata: Metadata = {
  title: "Página não encontrada",
};

/**
 * 404 de toda URL sem rota, inclusive de ferramenta "Em breve" (que ainda não
 * tem página). Renderiza dentro do layout raiz: header e <main> já existem.
 */
export default function NotFound() {
  return (
    <Container width="prose" className="flex flex-col gap-10 py-10 sm:py-16">
      <div className="flex flex-col items-start gap-4">
        <Heading level={1}>Página não encontrada</Heading>
        <p className="text-base text-muted sm:text-lg">
          O endereço pode ter sido digitado errado, ou a ferramenta ainda não
          está pronta.
        </p>
        <Button href="/" size="lg" className="w-full sm:w-auto">
          Ir para a página inicial
        </Button>
      </div>

      <section
        aria-labelledby="ferramentas-404"
        className="flex flex-col gap-3"
      >
        <Heading level={2} size="md" id="ferramentas-404">
          Ferramentas
        </Heading>
        <ul className="-mx-3 flex flex-col gap-1">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <ToolMenuItem tool={tool} />
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
