import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/cn";
import { getToolHref, type Tool } from "@/lib/tools";

function Transformation({ tool }: { tool: Tool }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5">
      <VisuallyHidden>De </VisuallyHidden>
      {tool.transformation.from.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
      <ArrowRight className="size-4 text-muted" aria-hidden="true" />
      <VisuallyHidden> para </VisuallyHidden>
      {tool.transformation.to.map((item) => (
        <Badge key={item} variant="info">
          {item}
        </Badge>
      ))}
    </p>
  );
}

type ToolCardProps = {
  tool: Tool;
  className?: string;
};

/**
 * Card de ferramenta: mostra o que entra e o que sai (ex.: PNG → WebP).
 * Só vira link quando a ferramenta está disponível.
 */
export function ToolCard({ tool, className }: ToolCardProps) {
  const Icon = tool.icon;
  const isAvailable = tool.status === "available";
  const isFeatured = Boolean(tool.featured);

  const content = (
    <>
      {isFeatured && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-checkerboard [mask-image:linear-gradient(to_left,black,transparent)] opacity-50 sm:block"
          aria-hidden="true"
        />
      )}
      {!isAvailable && (
        <Badge className="absolute top-5 right-5 sm:top-6 sm:right-6">
          Em breve
        </Badge>
      )}
      <div
        className={cn(
          "relative flex flex-col gap-3",
          isFeatured && "sm:max-w-md",
        )}
      >
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-control bg-info-soft text-primary",
            isFeatured ? "size-14" : "size-11",
          )}
          aria-hidden="true"
        >
          <Icon className={isFeatured ? "size-7" : "size-5"} />
        </span>
        <h3
          className={cn(
            "font-semibold tracking-tight text-foreground",
            isFeatured ? "text-2xl" : "text-lg",
          )}
        >
          {tool.name}
        </h3>
        <p className="text-muted">{tool.shortDescription}</p>
      </div>
      <div className="relative">
        <Transformation tool={tool} />
      </div>
    </>
  );

  const classes = cn(
    "relative flex h-full scroll-mt-24 flex-col justify-between gap-5 overflow-hidden rounded-card border border-line bg-surface p-5 shadow-card sm:p-6",
    isFeatured && "sm:flex-row sm:items-end sm:p-8",
    className,
  );

  if (isAvailable) {
    return (
      <Link
        id={tool.slug}
        href={getToolHref(tool)}
        className={cn(
          classes,
          "transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <article id={tool.slug} className={classes}>
      {content}
    </article>
  );
}
