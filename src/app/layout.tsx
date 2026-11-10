import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { siteConfig } from "@/lib/site-config";

import "./globals.css";

// Auto-hospedada no build: nenhuma requisição ao Google em tempo real.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
