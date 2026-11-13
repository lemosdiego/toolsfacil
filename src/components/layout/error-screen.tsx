import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";

type ErrorScreenProps = {
  /** Tenta renderizar de novo o trecho que falhou (o `retry` do Next). */
  onRetry: () => void;
};

/**
 * Conteúdo das telas de erro (`error.tsx` e `global-error.tsx`).
 * Não mostra a mensagem do erro: ela pode ter o nome do arquivo do usuário.
 */
export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <Container width="prose" className="flex flex-col gap-4 py-10 sm:py-16">
      <Heading level={1}>Algo deu errado</Heading>
      <p className="text-base text-muted sm:text-lg">
        Tente de novo. Se continuar, recarregue a página. Sua imagem não saiu do
        seu aparelho.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onRetry} className="w-full sm:w-auto">
          Tentar de novo
        </Button>
        <Button
          href="/"
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
        >
          Ir para a página inicial
        </Button>
      </div>
    </Container>
  );
}
