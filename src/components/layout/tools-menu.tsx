import { getToolsByCategory, toolCategories } from "@/lib/tools";

import { ToolMenuItem } from "./tool-menu-item";

const headingClasses = "px-3 text-sm font-semibold text-foreground";

/**
 * Conteúdo do menu de ferramentas: uma coluna por categoria do registro e a
 * coluna "Em breve". Uma coluna no celular, duas no tablet e três no desktop.
 */
export function ToolsMenu() {
  return (
    <nav
      aria-label="Ferramentas"
      className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {toolCategories.map((category) => {
        const headingId = `menu-categoria-${category.id}`;

        return (
          <div key={category.id} className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1">
        <p className={headingClasses}>Em breve</p>
        <p className="flex min-h-11 items-center px-3 text-sm text-muted">
          Novas ferramentas chegando.
        </p>
      </div>
    </nav>
  );
}
