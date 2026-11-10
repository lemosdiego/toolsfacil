import { cn } from "@/lib/cn";
import type { Tool } from "@/lib/tools";

import { ToolCard } from "./tool-card";

/**
 * Grade "bento": a ferramenta de destaque ocupa a linha inteira e as demais
 * se dividem abaixo. No celular, uma coluna na ordem recebida.
 * Passe as ferramentas já ordenadas (getToolsForDisplay).
 */
export function ToolGrid({ tools }: { tools: readonly Tool[] }) {
  // Com 2 colunas, se sobrar um card sozinho na última linha, ele ocupa as duas.
  const regularCount = tools.filter((tool) => !tool.featured).length;
  const lastIsAlone = regularCount % 2 === 1;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool, index) => (
        <li
          key={tool.slug}
          className={cn(
            tool.featured && "sm:col-span-2 lg:col-span-3",
            lastIsAlone &&
              !tool.featured &&
              index === tools.length - 1 &&
              "sm:col-span-2 lg:col-span-1",
          )}
        >
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
