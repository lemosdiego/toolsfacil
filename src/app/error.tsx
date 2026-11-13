"use client";

import { ErrorScreen } from "@/components/layout/error-screen";

type ErrorPageProps = {
  error: unknown;
  retry: () => void;
};

/**
 * Erro inesperado dentro de uma página (o header continua). De propósito, o
 * erro não é registrado nem enviado para fora: pode ter dados do arquivo.
 */
export default function ErrorPage({ retry }: ErrorPageProps) {
  return (
    <>
      <title>Algo deu errado</title>
      <ErrorScreen onRetry={retry} />
    </>
  );
}
