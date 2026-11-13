import type { FaqItem } from "@/lib/structured-data";

/* Textos da home (a mesma FAQ vai para o JSON-LD). */

export const homeIntro =
  "Converta, corte e compacte imagens direto no navegador. Escolha uma imagem e veja o que dá para fazer com ela: nada é enviado para servidor nenhum.";

export const homeFaq: readonly FaqItem[] = [
  {
    question: "O Tools Fácil é grátis?",
    answer:
      "Sim. Todas as ferramentas são gratuitas e funcionam sem cadastro nem instalação.",
  },
  {
    question: "Minhas imagens são enviadas para algum servidor?",
    answer:
      "Não. Todo o processamento acontece no seu navegador, e as imagens nunca saem do seu aparelho. Quando você fecha a página, elas somem da memória.",
  },
  {
    question: "Funciona no celular?",
    answer:
      'Sim. No celular, o botão "Escolher imagem" abre a galeria ou a câmera, e o arquivo pronto fica nos seus downloads.',
  },
  {
    question: "Quais formatos posso usar?",
    answer:
      "PNG, JPG e WebP nas ferramentas que já estão prontas. Fotos HEIC, o formato do iPhone, ganham um conversor em breve.",
  },
];
