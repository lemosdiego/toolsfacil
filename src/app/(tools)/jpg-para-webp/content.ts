import type { FaqItem } from "@/lib/structured-data";

/* Textos da página JPG para WebP (a mesma FAQ vai para o JSON-LD). */

export const content = {
  h1: "Converter JPG para WebP",
  title: "Converter JPG para WebP online e grátis",
  metaDescription:
    "Converta fotos JPG em WebP no navegador e deixe sites e lojas virtuais mais rápidos. Grátis, sem cadastro e sem enviar a foto para nenhum servidor.",
  intro:
    "Transforme fotos JPG em WebP, o formato mais leve para sites, blogs e lojas virtuais. A conversão acontece no seu navegador: a foto não sai do aparelho.",
};

export const faq: readonly FaqItem[] = [
  {
    question: "Quanto o arquivo diminui?",
    answer:
      "Depende da foto. Em geral, o WebP fica bem menor que o JPG com a mesma aparência. O tamanho antes e depois aparece na tela, junto com a porcentagem de redução.",
  },
  {
    question: "A foto do celular vai sair deitada?",
    answer:
      "Não. A orientação gravada pela câmera é aplicada antes da conversão, e a foto sai de pé.",
  },
  {
    question: "Qual qualidade devo escolher?",
    answer:
      "Comece com 80, o padrão: costuma reduzir bastante o arquivo sem diferença visível. Para fotos de produto com muitos detalhes, suba para 90. Para miniaturas, 60 ou 70 já bastam.",
  },
  {
    question: "Onde posso usar imagens WebP?",
    answer:
      "Em sites, blogs e lojas virtuais, que ficam mais rápidos com imagens leves. Todos os navegadores atuais abrem WebP. Alguns programas de edição mais antigos ainda não abrem: nesse caso, guarde também o JPG original.",
  },
  {
    question: "Posso converter PNG aqui?",
    answer:
      "Pode. Esta página aceita JPG e PNG. Se a imagem tem fundo transparente, ele é mantido no WebP.",
  },
  {
    question: "Minha foto é enviada para algum servidor?",
    answer:
      "Não. A conversão acontece no seu próprio aparelho, e a foto nunca sai dele. Os metadados, como a localização e o modelo da câmera, são removidos do arquivo convertido.",
  },
];
