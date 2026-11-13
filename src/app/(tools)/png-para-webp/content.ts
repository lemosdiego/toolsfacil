import type { FaqItem } from "@/lib/structured-data";

/* Textos da página PNG para WebP (a mesma FAQ vai para o JSON-LD). */

export const content = {
  h1: "Converter PNG para WebP",
  title: "Converter PNG para WebP online e grátis",
  metaDescription:
    "Converta PNG em WebP direto no navegador, com a transparência preservada e arquivos bem mais leves. Grátis, sem cadastro e sem enviar sua imagem.",
  intro:
    "Transforme imagens PNG em WebP, bem mais leves e com o fundo transparente preservado. A conversão acontece no seu navegador: a imagem não sai do aparelho.",
};

export const faq: readonly FaqItem[] = [
  {
    question: "A transparência do PNG é mantida?",
    answer:
      "Sim. As áreas transparentes do PNG continuam transparentes no WebP, então logos, ícones e recortes não ganham fundo.",
  },
  {
    question: "O WebP perde qualidade?",
    answer:
      "A conversão usa compressão com perdas, controlada pelo ajuste de qualidade. Com 80, a diferença costuma ser invisível. Para guardar o máximo de detalhes, suba a qualidade para perto de 100.",
  },
  {
    question: "Por que o WebP ficou maior que o PNG?",
    answer:
      "Acontece com imagens muito pequenas ou que já foram otimizadas. Nesse caso, a página avisa: você pode baixar mesmo assim ou diminuir a qualidade.",
  },
  {
    question: "Posso converter uma foto JPG aqui?",
    answer:
      "Pode. Esta página aceita PNG e JPG. Para fotos, a página JPG para WebP explica as diferenças em detalhes.",
  },
  {
    question: "Preciso instalar algum programa ou criar conta?",
    answer:
      "Não. Funciona direto no navegador, no computador ou no celular, sem cadastro.",
  },
  {
    question: "Minha imagem é enviada para algum servidor?",
    answer:
      "Não. A conversão acontece no seu próprio aparelho, e a imagem nunca sai dele. Os metadados, como a localização da foto, são removidos do arquivo convertido.",
  },
];
