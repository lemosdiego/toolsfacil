# Planos — Tools (nome provisório)

Painel das fases do projeto. Cada fase é um plano em [`phases/`](phases/), criado a partir do [modelo](TEMPLATE.md).

## Legenda de status

| Status          | Significado                                             |
| --------------- | ------------------------------------------------------- |
| ⬜ Não criado   | Fase prevista no roteiro; o plano ainda não foi escrito |
| 📝 Rascunho     | Plano escrito, aguardando aprovação                     |
| 👍 Aprovado     | Plano aprovado, pronto para implementar                 |
| 🚧 Em andamento | Implementação em curso na branch da fase                |
| 🔍 Em revisão   | PR aberto, aguardando merge                             |
| ✅ Concluído    | PR mergeado em `main`                                   |
| ⏸️ Pausado      | Interrompido; o motivo fica registrado no plano         |

## Roteiro do MVP

| #   | Fase                                                                                              | Status        | Branch                                                  | PR  |
| --- | ------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------- | --- |
| 01  | [Configurar Next.js, Tailwind e testes](phases/01-configurar-nextjs-tailwind-e-testes.md)         | ✅ Concluído  | `feat/01-configurar-nextjs-tailwind-e-testes`           | #1  |
| 02  | [Definir design tokens e componentes base](phases/02-definir-design-tokens-e-componentes-base.md) | ✅ Concluído  | `feat/02-definir-design-tokens-e-componentes-base`      | #2  |
| 03  | Construir layout e home das ferramentas                                                           | ⬜ Não criado | `feat/03-construir-layout-e-home-das-ferramentas`       | —   |
| 04  | Configurar SEO, sitemap e dados estruturados                                                      | ⬜ Não criado | `feat/04-configurar-seo-sitemap-e-dados-estruturados`   | —   |
| 05  | Criar envio, validação e download de imagens                                                      | ⬜ Não criado | `feat/05-criar-envio-validacao-e-download-de-imagens`   | —   |
| 06  | Converter PNG e JPG para WebP                                                                     | ⬜ Não criado | `feat/06-converter-png-e-jpg-para-webp`                 | —   |
| 07  | Converter HEIC para JPG                                                                           | ⬜ Não criado | `feat/07-converter-heic-para-jpg`                       | —   |
| 08  | Cortar e redimensionar com Cropper.js                                                             | ⬜ Não criado | `feat/08-cortar-e-redimensionar-com-cropperjs`          | —   |
| 09  | Compactar imagens no navegador                                                                    | ⬜ Não criado | `feat/09-compactar-imagens-no-navegador`                | —   |
| 10  | Criar páginas institucionais e de privacidade                                                     | ⬜ Não criado | `feat/10-criar-paginas-institucionais-e-privacidade`    | —   |
| 11  | Auditar segurança, desempenho e acessibilidade                                                    | ⬜ Não criado | `fix/11-auditar-seguranca-desempenho-e-acessibilidade`  | —   |
| 12  | Publicar o site e configurar o domínio                                                            | ⬜ Não criado | `feat/12-publicar-site-e-configurar-dominio`            | —   |
| 13  | Integrar AdSense com consentimento de cookies                                                     | ⬜ Não criado | `feat/13-integrar-adsense-com-consentimento-de-cookies` | —   |

> Ao criar o plano de uma fase, transforme o nome dela em link para o arquivo correspondente em `phases/`.
>
> **Blocos do roteiro:**
>
> - **01–04 · Fundação:** projeto, testes, identidade visual neutra, layout, home e SEO de base. Toda ferramenta já nasce com a estrutura de SEO pronta.
> - **05 · Infraestrutura das ferramentas:** área de soltar arquivo, validação pelo tipo real, Web Worker e download. Peças reaproveitadas por todas as ferramentas.
> - **06–09 · Ferramentas do MVP:** uma fase por ferramenta, cada uma com rota própria, texto explicativo, FAQ e testes E2E com imagens reais.
> - **10–11 · Preparação para o lançamento:** páginas exigidas pelo AdSense (Sobre, Contato, Privacidade, Termos) e auditoria antes de publicar.
> - **12–13 · Lançamento:** publicar com conteúdo suficiente para pedir a aprovação do AdSense e, depois de aprovado, ativar os anúncios com o consentimento de cookies.
> - **Depois do MVP:** novas ferramentas e pagamentos avulsos via Pix, cada um com plano próprio.
>
> **Por que o AdSense vem por último:** o Google só analisa o site publicado, com conteúdo original e as páginas institucionais. Os espaços dos anúncios já ficam reservados no layout desde a fase 03, sem script.
>
> **Hospedagem (fase 12):** ainda em aberto. O plano Hobby da Vercel não permite uso comercial. A decisão entra no plano da fase 12, e até lá o CI valida o build de produção a cada PR.
>
> As fases ⬜ ainda podem ser divididas, juntadas ou reordenadas. A numeração só fica fixa depois que o plano é criado.
