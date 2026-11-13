import type { Metadata } from "next";
import { notFound } from "next/navigation";

/* Lança um erro de propósito para ver a tela de erro, só em dev (404 em produção). */

export const metadata: Metadata = {
  title: "Exemplo de erro",
  robots: { index: false, follow: false },
};

export default function ErrorExamplePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  throw new Error("Erro de exemplo do styleguide");
}
