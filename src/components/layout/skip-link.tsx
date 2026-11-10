export const MAIN_CONTENT_ID = "conteudo";

/** Primeiro elemento focável: leva direto ao conteúdo principal. */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only rounded-control bg-primary px-4 py-3 font-medium text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Pular para o conteúdo
    </a>
  );
}
