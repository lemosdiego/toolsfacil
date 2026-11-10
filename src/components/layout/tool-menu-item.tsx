import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getToolHref, type Tool } from "@/lib/tools";

const itemClasses =
  "flex min-h-11 items-start gap-3 rounded-control px-3 py-2.5 text-left";

/** Item do menu: link quando disponível, texto com "Em breve" quando não. */
export function ToolMenuItem({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const content = (
    <>
      <Icon
        className="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2 font-medium">
          {tool.name}
          {tool.status === "soon" && <Badge>Em breve</Badge>}
        </span>
        <span className="text-sm text-muted">{tool.shortDescription}</span>
      </span>
    </>
  );

  if (tool.status === "available") {
    return (
      <Link
        href={getToolHref(tool)}
        className={cn(itemClasses, "transition-colors hover:bg-surface-muted")}
      >
        {content}
      </Link>
    );
  }

  return <div className={itemClasses}>{content}</div>;
}
