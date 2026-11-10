import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";
import { getToolHref, getToolsForDisplay } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-[3fr_2fr]">
        <div className="flex max-w-md flex-col gap-3">
          <p className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </p>
          <p className="text-sm text-muted">{siteConfig.description}</p>
          <p className="flex items-start gap-2 text-sm">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            Seus arquivos são processados no seu navegador e nunca são enviados
            para nenhum servidor.
          </p>
        </div>

        <nav aria-label="Ferramentas no rodapé">
          <h2 className="mb-3 text-sm font-semibold">Ferramentas</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {getToolsForDisplay().map((tool) => (
              <li key={tool.slug}>
                {tool.status === "available" ? (
                  <Link
                    href={getToolHref(tool)}
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                  >
                    {tool.name}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center text-muted">
                    {tool.name} (em breve)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-line">
        <Container className="py-4 text-sm text-muted">
          © {siteConfig.name}. Ferramentas gratuitas, sem cadastro.
        </Container>
      </div>
    </footer>
  );
}
