# Planos — Tools Fácil

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
| 🚫 Descartado   | Não será mergeado; o motivo fica registrado no plano    |

## Roteiro do MVP

| #   | Fase                                                                                              | Status        | Branch                                                  | PR  |
| --- | ------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------- | --- |
| 01  | [Configurar Next.js, Tailwind e testes](phases/01-configurar-nextjs-tailwind-e-testes.md)         | ✅ Concluído  | `feat/01-configurar-nextjs-tailwind-e-testes`           | #1  |
| 02  | [Definir design tokens e componentes base](phases/02-definir-design-tokens-e-componentes-base.md) | ✅ Concluído  | `feat/02-definir-design-tokens-e-componentes-base`      | #2  |
| 03  | [Construir layout e home das ferramentas](phases/03-construir-layout-e-home-das-ferramentas.md)   | 🚫 Descartado | `feat/03-construir-layout-e-home-das-ferramentas`       | #3  |
| 04  | [Construir header com menu de ferramentas](phases/04-construir-header-com-menu-de-ferramentas.md) | ✅ Concluído  | `feat/04-construir-header-com-menu-de-ferramentas`      | #4  |
| 05  | [Construir layout da página de ferramenta](phases/05-construir-layout-da-pagina-de-ferramenta.md) | 📝 Rascunho   | `feat/05-construir-layout-da-pagina-de-ferramenta`      | —   |
| 06  | Configurar SEO, dados estruturados e CSP                                                          | ⬜ Não criado | `feat/06-configurar-seo-dados-estruturados-e-csp`       | —   |
| 07  | Criar envio, validação e download de imagens                                                      | ⬜ Não criado | `feat/07-criar-envio-validacao-e-download-de-imagens`   | —   |
| 08  | Converter PNG e JPG para WebP                                                                     | ⬜ Não criado | `feat/08-converter-png-e-jpg-para-webp`                 | —   |
| 09  | Compactar imagens no navegador                                                                    | ⬜ Não criado | `feat/09-compactar-imagens-no-navegador`                | —   |
| 10  | Cortar e redimensionar com Cropper.js                                                             | ⬜ Não criado | `feat/10-cortar-e-redimensionar-com-cropperjs`          | —   |
| 11  | Converter HEIC para JPG                                                                           | ⬜ Não criado | `feat/11-converter-heic-para-jpg`                       | —   |
| 12  | Criar páginas institucionais e de privacidade                                                     | ⬜ Não criado | `feat/12-criar-paginas-institucionais-e-privacidade`    | —   |
| 13  | Auditar segurança, desempenho e acessibilidade                                                    | ⬜ Não criado | `fix/13-auditar-seguranca-desempenho-e-acessibilidade`  | —   |
| 14  | Aplicar identidade visual e logo                                                                  | ⬜ Não criado | `feat/14-aplicar-identidade-visual-e-logo`              | —   |
| 15  | Publicar o site e configurar o domínio                                                            | ⬜ Não criado | `feat/15-publicar-site-e-configurar-dominio`            | —   |
| 16  | Integrar AdSense com consentimento de cookies                                                     | ⬜ Não criado | `feat/16-integrar-adsense-com-consentimento-de-cookies` | —   |

> Ao criar o plano de uma fase, transforme o nome dela em link para o arquivo correspondente em `phases/`.
>
> **Blocos do roteiro:**
>
> - **01–06 · Fundação:** projeto, testes, identidade visual neutra, header com o menu de ferramentas, molde da página de ferramenta com os espaços de anúncio, SEO de base e cabeçalhos de segurança (CSP). Toda ferramenta já nasce com SEO e CSP prontos.
> - **07 · Infraestrutura das ferramentas:** área de soltar arquivo, validação pelo tipo real, Web Worker e download. Peças reaproveitadas por todas as ferramentas.
> - **08–11 · Ferramentas do MVP:** uma fase por ferramenta, cada uma com rota própria, texto explicativo, FAQ e testes E2E com imagens reais. A compactação (09) vem logo depois do WebP porque reaproveita quase tudo dele; o HEIC (11) fica por último por ser o de maior risco técnico (biblioteca pesada).
> - **12–14 · Preparação para o lançamento:** páginas exigidas pelo AdSense (Sobre, Contato, Privacidade, Termos), auditoria antes de publicar e a identidade visual (paleta, logo e ícone) do Tools Fácil.
> - **15–16 · Lançamento:** publicar com conteúdo suficiente para pedir a aprovação do AdSense e, depois de aprovado, ativar os anúncios com o consentimento de cookies.
> - **Depois do MVP:** novas ferramentas e pagamentos avulsos via Pix, cada um com plano próprio.
>
> **Telas por etapas:** depois da fase 03 (descartada), cada tela nasce de um print do usuário. A fase 04 entrega o header e o menu, e a 05 o molde da página de ferramenta com os espaços de anúncio. A home entra quando houver o print dela.
>
> **Por que o AdSense vem por último:** o Google só analisa o site publicado, com conteúdo original e as páginas institucionais. Os espaços dos anúncios ficam reservados no layout da página de ferramenta, sem script, desde a fase 05.
>
> **Hospedagem (fase 15):** ainda em aberto. O plano Hobby da Vercel não permite uso comercial. A decisão entra no plano da fase 15, e até lá o CI valida o build de produção a cada PR.
>
> **Nome e domínio:** o nome escolhido é **Tools Fácil** (domínio sugerido: `toolsfacil.com.br`, livre em 10/11/2026, ainda não registrado). O nome entra no código na fase 04, via `site-config.ts`.
>
> As fases ⬜ ainda podem ser divididas, juntadas ou reordenadas. A numeração só fica fixa depois que o plano é criado.
