import { useId } from "react";

import { getToolsByCategory, toolCategories } from "@/lib/tools";

import { ToolMenuItem } from "./tool-menu-item";

const headingClasses = "px-3 text-sm font-semibold text-foreground";

/**
 * Conteúdo do menu de ferramentas: uma coluna por categoria do registro e a
 * coluna "Em breve". Uma coluna no celular; a partir de sm, colunas de
 * largura fixa lado a lado, alinhadas à esquerda (quebram se não couberem).
 */
export function ToolsMenu() {
  // Ids únicos: o menu aparece no header e no exemplo do styleguide.
  const idPrefix = useId();

  return (
    <nav
      aria-label="Ferramentas"
      className="flex flex-col gap-x-10 gap-y-6 sm:flex-row sm:flex-wrap"
    >
      {toolCategories.map((category) => {
        const headingId = `${idPrefix}-${category.id}`;

        return (
          <div key={category.id} className="flex flex-col gap-1 sm:min-w-44">
            <p id={headingId} className={headingClasses}>
              {category.label}
            </p>
            <ul aria-labelledby={headingId} className="flex flex-col">
              {getToolsByCategory(category.id).map((tool) => (
                <li key={tool.slug}>
                  <ToolMenuItem tool={tool} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="flex flex-col gap-1 sm:min-w-44">
        <p className={headingClasses}>Em breve</p>
        <p className="flex min-h-11 items-center px-3 text-sm text-muted">
          Novas ferramentas chegando.
        </p>
      </div>
    </nav>
  );
}
