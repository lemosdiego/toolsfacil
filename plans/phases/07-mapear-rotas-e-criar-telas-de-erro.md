# 07 — Mapear rotas e criar telas de erro

**Status:** 🚧 Em andamento · **Branch:** `feat/07-mapear-rotas-e-criar-telas-de-erro` · **Depende de:** 04 e 05

## Objetivo

Definir **todas as rotas (telas) do site** num mapa único: URL, `h1`, `title`, layout, se entra no sitemap e qual fase entrega cada uma. A partir dele, as fases seguintes só seguem o mapa, sem decidir URL nem estrutura de novo.

A fase também entrega as telas que não dependem de nenhuma ferramenta: **página não encontrada (404)** e **erro inesperado**. Hoje, uma URL errada (ou uma ferramenta "Em breve" digitada na mão) cai na página padrão do Next, em inglês e sem o header.

## Mapa de rotas

### Telas do MVP

| Rota                       | Tela                  | `h1` (proposta)                       | `title` (proposta, até 60 caracteres)        | Layout                                       | Sitemap | Fase que entrega                              |
| -------------------------- | --------------------- | ------------------------------------- | -------------------------------------------- | -------------------------------------------- | ------- | --------------------------------------------- |
| `/`                        | Home                  | Ferramentas de imagem online e grátis | Ferramentas de imagem online e grátis        | Próprio (fase 06)                            | Sim     | 06 — Construir home com roteador de imagem    |
| `/png-para-webp`           | Ferramenta            | Converter PNG para WebP               | Converter PNG para WebP online e grátis      | `ToolPageLayout`                             | Sim\*   | Converter PNG e JPG para WebP                 |
| `/jpg-para-webp`           | Ferramenta            | Converter JPG para WebP               | Converter JPG para WebP online e grátis      | `ToolPageLayout`                             | Sim\*   | Converter PNG e JPG para WebP                 |
| `/compactar-imagem`        | Ferramenta            | Compactar imagem                      | Compactar imagem online sem perder qualidade | `ToolPageLayout`                             | Sim\*   | Compactar imagens no navegador                |
| `/cortador-de-imagem`      | Ferramenta            | Cortar e redimensionar imagem         | Cortar imagem online e redimensionar         | `ToolPageLayout`                             | Sim\*   | Cortar e redimensionar com Cropper.js         |
| `/heic-para-jpg`           | Ferramenta            | Converter HEIC para JPG               | Converter HEIC para JPG online (iPhone)      | `ToolPageLayout`                             | Sim\*   | Converter HEIC para JPG                       |
| `/sobre`                   | Institucional         | Sobre o Tools Fácil                   | Sobre                                        | Texto longo (`max-w-prose`)                  | Sim     | Criar páginas institucionais e de privacidade |
| `/contato`                 | Institucional         | Contato                               | Contato                                      | Texto longo (`max-w-prose`)                  | Sim     | Criar páginas institucionais e de privacidade |
| `/politica-de-privacidade` | Institucional         | Política de Privacidade               | Política de Privacidade                      | Texto longo (`max-w-prose`)                  | Sim     | Criar páginas institucionais e de privacidade |
| `/termos-de-uso`           | Institucional         | Termos de Uso                         | Termos de Uso                                | Texto longo (`max-w-prose`)                  | Sim     | Criar páginas institucionais e de privacidade |
| _(qualquer outra URL)_     | Página não encontrada | Página não encontrada                 | Página não encontrada                        | `not-found.tsx` (esta fase)                  | Não     | **07 (esta fase)**                            |
| _(erro inesperado)_        | Erro                  | Algo deu errado                       | Algo deu errado                              | `error.tsx` e `global-error.tsx` (esta fase) | Não     | **07 (esta fase)**                            |

\* Só entra no sitemap (e só vira link no menu e na home) quando o status no `tools.ts` vira `available`. Enquanto é `soon`, a rota não existe e responde 404.

- O `title` final ganha o sufixo do site pelo modelo do `seo.ts` (ex.: "Converter PNG para WebP online e grátis | Tools Fácil"). Os textos finais são revisados na fase de cada tela.
- Os slugs das ferramentas são os que já estão no `tools.ts` e no `CLAUDE.md`. Nenhum foi publicado ainda: esta é a última hora barata para trocar algum (depois, exige redirect 301).

### Rotas que não são telas

| Rota                                    | O que é                                               | Fase que entrega                              |
| --------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `/sitemap.xml`                          | Gerado do registro de ferramentas + páginas fixas     | Configurar SEO, dados estruturados e CSP      |
| `/robots.txt`                           | Libera tudo, menos `/api/`                            | Configurar SEO, dados estruturados e CSP      |
| `/ads.txt`                              | Linha do publisher do AdSense (arquivo em `public/`)  | Integrar AdSense com consentimento de cookies |
| `/api/*`                                | Webhooks do Pix                                       | Depois do MVP (plano próprio)                 |
| `/styleguide`, `/styleguide/ferramenta` | Referência visual, só em `pnpm dev` (404 em produção) | 02 e 05 (já existem)                          |

### Navegação entre as telas

- **Header (fase 04):** leva às ferramentas (menu "Ferramentas") e à home (nome do site).
- **Footer (fase das páginas institucionais):** links para Sobre, Contato, Política de Privacidade e Termos de Uso. O AdSense espera achar a Política de Privacidade a partir de qualquer página.
- **Home (fase 06):** grade de ferramentas e roteador de imagem.
- **404:** link para a home e lista das ferramentas.

### Ideias para depois do MVP (fora deste mapa)

- **Páginas de categoria** (`/converter`, `/editar`): fazem sentido quando houver ferramentas suficientes em cada grupo. Com 2 ou 3 por categoria, repetiriam a grade da home e o menu (página fina, que o AdSense não gosta).
- **Página "Todas as ferramentas"**: mesma razão. A grade da home e o menu já cobrem.

## Referência visual

Sem print do usuário para a 404 e o erro. Rascunho no padrão das outras telas:

```
┌──────────────────────────┐
│ Tools Fácil [Ferramentas▾]│  header (fase 04)
├──────────────────────────┤
│                          │
│ Página não encontrada    │  h1
│ O endereço pode ter sido │
│ digitado errado ou a     │
│ ferramenta ainda não     │
│ está pronta.             │
│                          │
│ [ Ir para a página     ] │  Button primary, largura toda no celular
│ [ inicial              ] │
│                          │
│ Ferramentas (h2)         │
│ PNG para WebP  Em breve  │  lista lida do registro
│ JPG para WebP  Em breve  │  (link quando available)
│ ...                      │
└──────────────────────────┘
```

A tela de erro segue o mesmo molde: `h1` "Algo deu errado", texto curto ("Tente de novo. Se continuar, recarregue a página."), botão "Tentar de novo" e link para a home. Sem lista de ferramentas.

## Escopo

- **Inclui:**
  - **Mapa de rotas** no `CLAUDE.md` (seção nova "Mapa de rotas"), resumido a partir deste plano: rota, tela, layout e regra de sitemap. A lista das ferramentas continua tendo o `tools.ts` como fonte da verdade (o mapa aponta para ele, sem repetir os dados)
  - **`src/app/not-found.tsx`** (Server Component): `h1`, texto, botão para a home e a lista das ferramentas lida do registro (reaproveita o `ToolMenuItem`: link quando `available`, "Em breve" quando `soon`). Renderiza dentro do layout raiz, então já tem header e `<main>`
  - **`src/app/error.tsx`** (`"use client"`): `h1`, texto, botão "Tentar de novo" (chama `retry()`) e link para a home
  - **`src/app/global-error.tsx`** (`"use client"`): versão mínima para erro no próprio layout raiz, com `<html lang="pt-BR">`, `<body>`, os estilos globais e o `<title>` do React (o arquivo não aceita `metadata`)
  - **Rota de teste do erro** em `/styleguide/erro` (só em dev), que lança um erro de propósito, para o E2E ver a tela de erro
  - Atualizar a estrutura de pastas do `CLAUDE.md` com os três arquivos novos
- **Não inclui:**
  - As páginas das ferramentas, as institucionais e o footer (cada uma na sua fase, seguindo o mapa)
  - `sitemap.ts`, `robots.ts`, metadados de SEO e JSON-LD (fase de SEO)
  - Páginas de categoria e "Todas as ferramentas"
  - Serviço de monitoramento de erros (seria um serviço externo novo, fora do escopo)

## Decisões técnicas

| Decisão                                                                        | Motivo                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ferramenta `soon` não tem rota (404)**, em vez de uma página "Em breve"      | Uma página quase vazia indexada atrapalha a aprovação do AdSense e o SEO. A rota nasce junto com a ferramenta pronta                                                                                                                         |
| **`not-found.tsx` na raiz do `app/`**, e não o `global-not-found.tsx`          | O site tem um layout raiz só. O `not-found.tsx` já pega toda URL sem rota, renderiza dentro do layout (header, fonte, tokens) e o Next coloca `noindex` sozinho. O `global-not-found` é experimental e obrigaria a repetir o layout          |
| **404 com a lista de ferramentas**                                             | Quem erra a URL quase sempre procura uma ferramenta: a lista resolve em um clique. Reaproveitar o `ToolMenuItem` mantém a regra do "Em breve" sem link                                                                                       |
| **`error.tsx` com `retry()`**, como na documentação local do Next 16           | O `retry()` busca e renderiza de novo o trecho que falhou. Resolve falhas passageiras sem recarregar a página                                                                                                                                |
| **Sem log nem envio do erro para fora**                                        | A mensagem do erro pode ter o nome do arquivo do usuário. Regra de ouro: nada do arquivo vai para log ou serviço externo. Erros esperados (arquivo inválido, imagem grande demais) continuam tratados dentro de cada ferramenta, com `Alert` |
| **`global-error.tsx` mínimo**                                                  | Só aparece se o próprio layout raiz quebrar. Precisa do próprio `<html>` e importa os estilos globais para não ficar sem os tokens. Sem header (ele faz parte do layout que quebrou)                                                         |
| **Contato sem formulário**, só com e-mail (no mapa, para a fase institucional) | Um formulário precisaria de servidor ou serviço externo para enviar a mensagem. O e-mail de contato entra no `site-config.ts`                                                                                                                |
| **Mapa resumido no `CLAUDE.md`**, com o `tools.ts` como fonte das ferramentas  | O `CLAUDE.md` é lido em toda sessão: assim nenhuma fase cria rota fora do mapa. Repetir slugs e nomes em dois lugares faria os dois saírem de sincronia                                                                                      |
| **Sem bibliotecas novas**                                                      | Só convenções de arquivo do Next e os componentes da fase 02                                                                                                                                                                                 |

## Tarefas

- [x] Escrever a seção "Mapa de rotas" no `CLAUDE.md` e atualizar a estrutura de pastas
- [x] Criar o `not-found.tsx` com a lista de ferramentas
- [x] Criar o `error.tsx` com "Tentar de novo"
- [x] Criar o `global-error.tsx` mínimo
- [x] Criar a rota `/styleguide/erro` (só em dev)
- [x] Testes de componente e E2E (desktop e mobile)
- [x] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `docs: adiciona o mapa de rotas do site ao CLAUDE.md`
2. `feat(layout): adiciona página não encontrada com a lista de ferramentas`
3. `feat(layout): adiciona telas de erro com opção de tentar de novo`
4. `test(e2e): verifica a página não encontrada e a tela de erro`
5. `docs(plans): registra notas da implementação da fase 07`

Os testes de componente entram no mesmo commit do código.

## Testes

- **Testing Library:**
  - `not-found`: um único `h1` "Página não encontrada", link para a home, todas as ferramentas do registro (as `soon` sem link e com "Em breve"), sem outro `<main>`
  - `error`: `h1` "Algo deu errado"; o botão "Tentar de novo" chama `retry`; link para a home
  - `global-error`: renderiza `<html lang="pt-BR">` com o `h1` e o botão
- **Playwright (desktop e mobile):**
  - `/endereco-que-nao-existe` responde **404**, com o `h1`, o header e `<meta name="robots" content="noindex">`
  - Uma ferramenta `soon` digitada na mão (ex.: `/png-para-webp`) responde 404, sem página quebrada
  - O botão da 404 leva à home
  - Em 360px, sem rolagem horizontal; `h1` e botão acima da dobra
  - `/styleguide/erro` (só no modo dev) mostra a tela de erro, e "Tentar de novo" tenta renderizar de novo
  - axe sem violações nos temas claro e escuro (404 e erro)

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [x] O mapa de rotas está no `CLAUDE.md`, com todas as telas do MVP, a fase de cada uma e a regra do sitemap
- [x] URL inexistente e ferramenta `soon` respondem 404 com a página em português, header e lista de ferramentas
- [x] Erro inesperado mostra a tela de erro com "Tentar de novo", sem enviar nada para fora
- [x] No celular, sem rolagem horizontal e com o botão acima da dobra
- [x] axe sem violações nos dois temas
- [x] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Slugs:** confirmar os cinco slugs das ferramentas antes de qualquer publicação. Em especial `/cortador-de-imagem` (o menu diz "Cortar imagem"; a alternativa seria `/cortar-imagem`, que segue o verbo como `/compactar-imagem`).
- **`h1` e `title` propostos:** são rascunhos para guiar as fases. O texto final é revisado na fase de cada tela.
- **Contato só por e-mail:** sem formulário, para não precisar de servidor. O e-mail vem do `site-config.ts`, preenchido por você.

## Notas da implementação

**Desvios do plano**

- **`ErrorScreen` compartilhado** (`src/components/layout/`): o `error.tsx` e o `global-error.tsx` usam o mesmo conteúdo (`h1`, texto, "Tentar de novo" e "Ir para a página inicial"). A mensagem do erro nunca é exibida.
- **Título da aba no `error.tsx`** pelo `<title>` do React, porque arquivos `"use client"` não exportam `metadata`. A 404 usa `metadata` normalmente.
- **`fireEvent` em vez de `user-event`** nos testes de componente: o `@testing-library/user-event` não está instalado, e um clique simples não justifica uma dependência nova.
- **E2E da mensagem do erro só dentro do `<main>`:** em dev, o painel de erros do Next mostra a mensagem por cima da página. A garantia de que a página não a exibe fica no teste de componente.
- **"Tentar de novo" no E2E:** o exemplo `/styleguide/erro` sempre falha, então o teste confere que o `retry` roda e que a tela de erro volta. A recuperação de verdade é coberta pelo teste de componente (o botão chama o `retry` do Next).
- **Ferramenta em breve no E2E:** o teste usa `/heic-para-jpg`, a última ferramenta prevista para ficar pronta, para não quebrar quando o WebP virar `available`.

**Testes:** 112 de unidade e componente; E2E com 80 testes em dev e 44 no build de produção (desktop e mobile).

**Pendências**

- A rota `/styleguide/erro` não tem link na página `/styleguide`: é acessada direto pela URL.
- O `title` das telas ainda não tem o sufixo do site: o modelo de título entra com a fase de SEO.
