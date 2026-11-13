import type { FaqItem } from "@/lib/structured-data";

/**
 * Perguntas frequentes em `<details>` (nativo, o texto fica no HTML para o
 * SEO). Use a mesma lista no `faqPageJsonLd()` da página.
 */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map(({ question, answer }) => (
        <details
          key={question}
          className="rounded-control border border-line bg-surface p-4"
        >
          <summary className="cursor-pointer font-medium">{question}</summary>
          <p className="mt-2 text-muted">{answer}</p>
        </details>
      ))}
    </div>
  );
}
