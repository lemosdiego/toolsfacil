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

## Fases com plano

Numeradas na ordem em que os planos foram criados (o número nasce com o plano).

| #   | Fase                                                                                                         | Status        | Branch                                                   | PR  |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------- | --- |
| 01  | [Configurar Next.js, Tailwind e testes](phases/01-configurar-nextjs-tailwind-e-testes.md)                    | ✅ Concluído  | `feat/01-configurar-nextjs-tailwind-e-testes`            | #1  |
| 02  | [Definir design tokens e componentes base](phases/02-definir-design-tokens-e-componentes-base.md)            | ✅ Concluído  | `feat/02-definir-design-tokens-e-componentes-base`       | #2  |
| 03  | [Construir layout e home das ferramentas](phases/03-construir-layout-e-home-das-ferramentas.md)              | 🚫 Descartado | `feat/03-construir-layout-e-home-das-ferramentas`        | #3  |
| 04  | [Construir header com menu de ferramentas](phases/04-construir-header-com-menu-de-ferramentas.md)            | ✅ Concluído  | `feat/04-construir-header-com-menu-de-ferramentas`       | #4  |
| 05  | [Construir layout da página de ferramenta](phases/05-construir-layout-da-pagina-de-ferramenta.md)            | ✅ Concluído  | `feat/05-construir-layout-da-pagina-de-ferramenta`       | #5  |
| 06  | [Construir home com roteador de imagem](phases/06-construir-home-com-roteador-de-imagem.md)                  | ✅ Concluído  | `feat/06-construir-home-com-roteador-de-imagem`          | #10 |
| 07  | [Mapear rotas e criar telas de erro](phases/07-mapear-rotas-e-criar-telas-de-erro.md)                        | ✅ Concluído  | `feat/07-mapear-rotas-e-criar-telas-de-erro`             | #6  |
| 08  | [Configurar SEO, dados estruturados e CSP](phases/08-configurar-seo-dados-estruturados-e-csp.md)             | ✅ Concluído  | `feat/08-configurar-seo-dados-estruturados-e-csp`        | #7  |
| 09  | [Criar envio, validação e download de imagens](phases/09-criar-envio-validacao-e-download-de-imagens.md)     | ✅ Concluído  | `feat/09-criar-envio-validacao-e-download-de-imagens`    | #8  |
| 10  | [Converter PNG e JPG para WebP](phases/10-converter-png-e-jpg-para-webp.md)                                  | ✅ Concluído  | `feat/10-converter-png-e-jpg-para-webp`                  | #9  |
| 11  | [Compactar imagens no navegador](phases/11-compactar-imagens-no-navegador.md)                                | ✅ Concluído  | `feat/11-compactar-imagens-no-navegador`                 | #11 |
| 12  | [Cortar e redimensionar com Cropper.js](phases/12-cortar-e-redimensionar-com-cropperjs.md)                   | 🔍 Em revisão | `feat/12-cortar-e-redimensionar-com-cropperjs`           | #12 |
| 13  | [Converter HEIC para JPG](phases/13-converter-heic-para-jpg.md)                                              | 📝 Rascunho   | `feat/13-converter-heic-para-jpg`                        | —   |
| 14  | [Criar páginas institucionais e de privacidade](phases/14-criar-paginas-institucionais-e-de-privacidade.md)  | 📝 Rascunho   | `feat/14-criar-paginas-institucionais-e-de-privacidade`  | —   |
| 15  | [Auditar segurança, desempenho e acessibilidade](phases/15-auditar-seguranca-desempenho-e-acessibilidade.md) | 📝 Rascunho   | `chore/15-auditar-seguranca-desempenho-e-acessibilidade` | —   |
| 16  | [Aplicar identidade visual e logo](phases/16-aplicar-identidade-visual-e-logo.md)                            | 📝 Rascunho   | `feat/16-aplicar-identidade-visual-e-logo`               | —   |
| 17  | [Publicar o site e configurar o domínio](phases/17-publicar-o-site-e-configurar-o-dominio.md)                | 📝 Rascunho   | `chore/17-publicar-o-site-e-configurar-o-dominio`        | —   |
| 18  | [Integrar AdSense com consentimento de cookies](phases/18-integrar-adsense-com-consentimento-de-cookies.md)  | 📝 Rascunho   | `feat/18-integrar-adsense-com-consentimento-de-cookies`  | —   |

## Roteiro (fases sem plano)

Em ordem de prioridade, **sem número**: a fase só ganha número (e branch) quando o plano dela é criado. Pode ser dividida, juntada ou reordenada à vontade.

Todas as fases previstas já têm plano (12 a 18). Fase nova entra aqui, sem número, até o plano dela ser criado.

> Ao criar o plano de uma fase, ela sai do roteiro e entra na tabela de cima, com o próximo número e a branch.
>
> **Blocos do roteiro:**
>
> - **Fundação (01, 02, 04, 05, 07 e 08):** projeto, testes, identidade visual neutra, header com o menu de ferramentas, molde da página de ferramenta com os espaços de anúncio, SEO de base e cabeçalhos de segurança (CSP). Toda ferramenta já nasce com SEO e CSP prontos.
> - **Infraestrutura das ferramentas (09):** área de soltar arquivo, validação pelo tipo real, Web Worker e download. Peças reaproveitadas por todas as ferramentas.
> - **Ferramentas do MVP (10 a 13):** uma fase por ferramenta, cada uma com rota própria, texto explicativo, FAQ e testes E2E com imagens reais. A compactação (11) vem logo depois do WebP porque reaproveita quase tudo dele; o HEIC fica por último por ser o de maior risco técnico (biblioteca pesada).
> - **Home (06):** a pessoa escolhe a imagem na home, que sugere as ferramentas compatíveis com o tipo do arquivo e leva a imagem até a escolhida, sem nova escolha. Só pode ser implementada depois das fases 08, 09 e 10.
> - **Preparação para o lançamento (14 a 16):** páginas exigidas pelo AdSense (Sobre, Contato, Privacidade, Termos), auditoria antes de publicar e a identidade visual (paleta, logo e ícone) do Tools Fácil.
> - **Lançamento (17 e 18):** publicar com conteúdo suficiente para pedir a aprovação do AdSense e, depois de aprovado, ativar os anúncios com o consentimento de cookies.
> - **Depois do MVP:** novas ferramentas e pagamentos avulsos via Pix, cada um com plano próprio.
>
> **Telas por etapas:** depois da fase 03 (descartada), cada tela nasce de um print do usuário. A fase 04 entrega o header e o menu, a 05 o molde da página de ferramenta com os espaços de anúncio, a 06 a home com o roteador de imagem e a 07 o mapa de todas as rotas, com as telas de 404 e de erro.
>
> **Por que o AdSense vem por último:** o Google só analisa o site publicado, com conteúdo original e as páginas institucionais. Os espaços dos anúncios ficam reservados no layout da página de ferramenta, sem script, desde a fase 05.
>
> **Hospedagem:** ainda em aberto. O plano Hobby da Vercel não permite uso comercial. A decisão entra no plano da publicação (17), e até lá o CI valida o build de produção a cada PR.
>
> **Nome e domínio:** o nome escolhido é **Tools Fácil** (domínio sugerido: `toolsfacil.com.br`, livre em 10/11/2026, ainda não registrado). O nome entra no código na fase 04, via `site-config.ts`.
