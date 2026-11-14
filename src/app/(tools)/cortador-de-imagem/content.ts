import type { FaqItem } from "@/lib/structured-data";

/* Textos da página Cortar e redimensionar imagem (a mesma FAQ vai para o JSON-LD). */

export const content = {
  h1: "Cortar e redimensionar imagem",
  title: "Cortar e redimensionar imagem online, grátis",
  metaDescription:
    "Corte fotos livremente ou nas proporções do Instagram, Stories e YouTube, gire e ajuste a largura e a altura. Grátis, sem cadastro e sem enviar sua imagem.",
  intro:
    "Corte a imagem do jeito que quiser ou nas proporções das redes sociais, gire e defina o tamanho final em pixels. Tudo acontece no seu navegador: a imagem não sai do aparelho.",
};

export const faq: readonly FaqItem[] = [
  {
    question: "Qual proporção usar em cada rede social?",
    answer:
      "1:1 para o feed e a foto de perfil, 4:5 para fotos em pé no feed do Instagram, 9:16 para Stories, Reels e TikTok, e 16:9 para vídeos e capas do YouTube. Use o corte livre para qualquer outro formato.",
  },
  {
    question: "Como deixar a imagem com 1080 × 1080 pixels?",
    answer:
      'Escolha a proporção 1:1, ajuste o corte e digite 1080 na largura: com a proporção travada, a altura acompanha. Depois toque em "Cortar imagem" e baixe o resultado.',
  },
  {
    question: "Cortar diminui a qualidade?",
    answer:
      "Não de forma visível. A imagem sai no mesmo formato da original, e JPG e WebP são gravados com qualidade alta. Só aumentar o tamanho além do corte deixa a imagem menos nítida, porque não existem detalhes novos para preencher.",
  },
  {
    question: "O fundo transparente do PNG continua transparente?",
    answer:
      "Sim. PNG e WebP saem com a transparência. Só o JPG, que não tem transparência, ganha fundo branco.",
  },
  {
    question: "Dá para girar uma foto que ficou deitada?",
    answer:
      'Dá. O botão "Girar 90°" gira a imagem no sentido horário; toque de novo para continuar girando. Fotos do celular já abrem na posição certa.',
  },
  {
    question: "Minha imagem é enviada para algum servidor?",
    answer:
      "Não. O corte acontece no seu próprio aparelho, e a imagem nunca sai dele. Os metadados, como a localização da foto, são removidos do arquivo cortado.",
  },
];
