import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/cn";
import {
  getToolHref,
  getToolsByCategory,
  toolCategories,
  type Tool,
} from "@/lib/tools";

const cardClasses =
  "flex h-full flex-col gap-2 rounded-card border border-line bg-surface p-5 shadow-card";

function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status === "available") {
    return (
      <Link
        href={getToolHref(tool)}
        className={cn(
          cardClasses,
          "group transition-shadow hover:shadow-raised",
        )}
      >
        <span className="flex items-center justify-between gap-2 font-semibold text-foreground">
          {tool.name}
          <ArrowRight
            className="size-4 text-muted transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
        <span className="text-sm text-muted">{tool.shortDescription}</span>
      </Link>
    );
  }

  return (
    <div className={cn(cardClasses, "shadow-none")}>
      <span className="flex items-center justify-between gap-2 font-semibold text-muted">
        {tool.name}
        <Badge>Em breve</Badge>
      </span>
      <span className="text-sm text-muted">{tool.shortDescription}</span>
    </div>
  );
}

/**
 * Todas as ferramentas do registro, por categoria. As prontas são links; as
 * "Em breve" aparecem sem link. Chega pronta no HTML (links internos e SEO).
 */
export function ToolGrid() {
  return (
    <div className="flex flex-col gap-8">
      {toolCategories.map((category) => (
        <section
          key={category.id}
          aria-labelledby={`ferramentas-${category.id}`}
          className="flex flex-col gap-3"
        >
          <Heading level={3} id={`ferramentas-${category.id}`}>
            {category.label}
          </Heading>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getToolsByCategory(category.id).map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
