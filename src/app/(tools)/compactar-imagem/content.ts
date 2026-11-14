import type { FaqItem } from "@/lib/structured-data";

/* Textos da página Compactar imagem (a mesma FAQ vai para o JSON-LD). */

export const content = {
  h1: "Compactar imagem",
  title: "Compactar imagem online: reduza KB de JPG, PNG e WebP",
  metaDescription:
    "Reduza o tamanho de fotos JPG, PNG e WebP sem trocar o formato e sem perda visível, ou deixe a imagem com até 100 KB. Grátis, sem cadastro e sem enviar sua imagem.",
  intro:
    "Diminua o tamanho em KB de uma imagem JPG, PNG ou WebP, no mesmo formato e sem perda visível. A compactação acontece no seu navegador: a imagem não sai do aparelho.",
};

export const faq: readonly FaqItem[] = [
  {
    question: "A imagem perde qualidade ao compactar?",
    answer:
      "No JPG e no WebP, a compactação descarta detalhes que o olho quase não percebe. Com a qualidade 75, a diferença costuma ser invisível; para guardar mais detalhes, suba a qualidade. No PNG, a otimização é sem perdas: nenhum pixel muda.",
  },
  {
    question: "Como deixar uma foto com até 100 KB?",
    answer:
      'Escolha o modo "Tamanho máximo" e o atalho 100 KB (ou digite outro valor). A página acha a maior qualidade que cabe no limite. Se nem a qualidade mínima couber, ela avisa quanto ficou: aí é preciso diminuir a largura e a altura da imagem.',
  },
  {
    question: "O formato da imagem muda?",
    answer:
      "Não. Um JPG continua JPG, um PNG continua PNG e um WebP continua WebP, com as mesmas dimensões. Para trocar de formato, use os conversores do site.",
  },
  {
    question: "Por que o PNG reduz tão pouco?",
    answer:
      "Porque a compactação do PNG aqui é sem perdas: a imagem fica idêntica, e o ganho vem só de guardar os dados de um jeito mais eficiente. Para um arquivo bem menor, mantendo a transparência, converta o PNG para WebP.",
  },
  {
    question: "Por que a imagem não ficou menor?",
    answer:
      "Acontece com imagens que já foram compactadas antes, como fotos tiradas de redes sociais. A página avisa quando isso acontece, e você pode usar a imagem original ou diminuir a qualidade.",
  },
  {
    question: "Minha imagem é enviada para algum servidor?",
    answer:
      "Não. A compactação acontece no seu próprio aparelho, e a imagem nunca sai dele. Os metadados, como a localização da foto, são removidos do arquivo compactado.",
  },
];
