"use client";

import { Inter } from "next/font/google";

import { ErrorScreen } from "@/components/layout/error-screen";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

type GlobalErrorProps = {
  error: unknown;
  retry: () => void;
};

/**
 * Erro no próprio layout raiz: substitui o documento inteiro (sem header).
 * Por isso traz o próprio <html>, os estilos globais e a fonte. Não aceita
 * `metadata`: o título vem pelo <title> do React.
 */
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <title>Algo deu errado</title>
        <main className="flex flex-1 flex-col">
          <ErrorScreen onRetry={retry} />
        </main>
      </body>
    </html>
  );
}
