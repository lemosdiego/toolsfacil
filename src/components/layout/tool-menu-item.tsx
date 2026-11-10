import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { getToolHref, type Tool } from "@/lib/tools";

// min-h-11 = 44px, o alvo de toque mínimo. A linha inteira é clicável.
const itemClasses =
  "flex min-h-11 items-center gap-2 rounded-control px-3 py-2 text-sm";

/** Item do menu: link quando disponível, texto com "Em breve" quando não. */
export function ToolMenuItem({ tool }: { tool: Tool }) {
  if (tool.status === "available") {
    return (
      <Link
        href={getToolHref(tool)}
        className={cn(
          itemClasses,
          "font-medium transition-colors hover:bg-surface-muted",
        )}
      >
        {tool.name}
      </Link>
    );
  }

  return (
    <div className={cn(itemClasses, "text-muted")}>
      {tool.name}
      <Badge>Em breve</Badge>
    </div>
  );
}
