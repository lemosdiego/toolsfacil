# 06 — Construir home com roteador de imagem

**Status:** 📝 Rascunho · **Branch:** `feat/06-construir-home-com-roteador-de-imagem` · **Depende de:** 04, 05 e das fases (sem plano) _Criar envio, validação e download de imagens_ e _Converter PNG e JPG para WebP_

## Objetivo

Trocar a home provisória ("Em breve") por uma home enxuta em que **a pessoa chega e já usa**, sem prender a home a uma ferramenta só.

No topo, a pessoa escolhe a imagem. A home descobre o tipo real do arquivo (pela assinatura dos bytes) e mostra só as ações que fazem sentido para ele: um HEIC mostra "Converter para JPG", um PNG mostra "Converter para WebP", "Compactar" e "Cortar". Ao clicar numa ação, a pessoa vai para a página da ferramenta **com o arquivo já carregado**, sem precisar escolher de novo. O arquivo fica em memória e nunca sai do navegador.

Abaixo do topo, a grade com todas as ferramentas, para quem prefere navegar, e um texto curto e original sobre o site (o AdSense recusa home sem conteúdo).

Cada ferramenta continua sendo a página de entrada da busca do Google. A home não compete com elas pela palavra-chave de cada uma: o alvo dela é a busca ampla ("ferramentas de imagem online grátis").

## Referência visual

Ainda sem print do usuário. O rascunho abaixo segue o padrão das outras telas e deve ser trocado pelo print antes da implementação, se houver um.

**Desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│ Tools Fácil                                [ Ferramentas ▾ ] │  header (fase 04)
└─────────────────────────────────────────────────────────────┘

   Ferramentas de imagem online e grátis  (h1)
   Converta, corte e compacte direto no navegador.
   Suas imagens não saem do seu aparelho.

   ┌───────────────────────────────────────────────────────┐
   │                 [ Escolher imagem ]                   │  área de soltar (fase do envio)
   │                  ou arraste aqui                      │
   └───────────────────────────────────────────────────────┘

   ── depois de escolher ──────────────────────────────────
   foto.png · PNG · 2,1 MB                  [Trocar imagem]
   O que você quer fazer?
   [ Converter para WebP ]  [ Compactar ]  [ Cortar ]

   Todas as ferramentas  (h2)
   Converter                       Editar
   ┌────────────┐┌────────────┐    ┌────────────┐┌────────────┐
   │PNG para    ││JPG para    │    │Compactar   ││Cortar      │
   │WebP        ││WebP        │    │imagem      ││imagem      │
   └────────────┘└────────────┘    └────────────┘└────────────┘
   ┌────────────┐
   │HEIC para   │ Em breve
   │JPG         │
   └────────────┘

   ─────────────────── espaço de segurança ────────────────────
   Publicidade
   [                 anúncio (below-tool)                  ]
   ─────────────────────────────────────────────────────────────

   Como funciona (h2) · Privacidade (h2) · Perguntas frequentes (h2)
```

**Celular (360px):** uma coluna. O `h1`, o texto curto e o botão "Escolher imagem" ficam acima da dobra. As ações aparecem logo abaixo do botão, em botões com a largura toda (44px ou mais de altura). A grade vira uma coluna de cards.

## Escopo

- **Inclui:**
  - **Home nova** (`src/app/page.tsx`, Server Component): `h1`, texto curto, a ilha do roteador, a grade de ferramentas, o anúncio e o texto sobre o site
  - **Ilha `ImageRouter`** (`src/components/home/`, `"use client"`): reaproveita a área de soltar e a validação da fase de envio e download. Depois da escolha, mostra o nome, o tipo e o tamanho do arquivo, o botão "Trocar imagem" e as ações compatíveis
  - **Formatos aceitos no registro:** campo `accepts` em cada ferramenta do `tools.ts` (ex.: `["image/png"]` no PNG para WebP) e a consulta `getToolsForFileType()`, função pura e testada
  - **Passagem do arquivo entre rotas:** um store em memória no cliente (`src/lib/pending-file.ts`) com `setPendingFile()` e `takePendingFile()`. A ilha de cada ferramenta lê o arquivo ao abrir e o consome (uma vez só)
  - **Integração nas ferramentas `available`:** a ilha de cada ferramenta pronta (no mínimo a do conversor de PNG e JPG para WebP) passa a aceitar o arquivo vindo da home
  - **Grade de ferramentas** (`ToolGrid`, Server Component), lida do registro e agrupada por `toolCategories`. As ferramentas `soon` aparecem com o selo "Em breve" e sem link
  - **Texto da home:** como funciona (3 passos), aviso de privacidade e 3 ou 4 perguntas frequentes em `<details>`
  - **SEO da home:** `title`, `description`, `canonical` (`/`) e `openGraph` a partir do `seo.ts` (fase de SEO, dados estruturados e CSP), e JSON-LD `WebSite` + `FAQPage` pelo componente `JsonLd`
  - Atualizar o `CLAUDE.md` (home, campo `accepts`, store de arquivo pendente)
- **Não inclui:**
  - Lote (várias imagens de uma vez) e colar imagem da área de transferência
  - Footer (fica para a fase das páginas institucionais)
  - Ferramentas novas: as ações só aparecem para as ferramentas do registro
  - Lembrar o arquivo depois de recarregar a página (de propósito, ver "Decisões técnicas")

## Decisões técnicas

| Decisão                                                                                                                                                                     | Motivo                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Roteador na home, e não uma ferramenta embutida**                                                                                                                         | A pessoa já usa a página ao chegar, sem eleger uma ferramenta "principal" e sem a home disputar a busca com as páginas das ferramentas                                                                |
| **Ações filtradas pelo tipo real do arquivo** (assinatura dos bytes, da fase de envio e download)                                                                           | Uma foto `.jpg` que na verdade é HEIC (comum no iPhone) recebe a ação certa. Ação que não serve para o arquivo não aparece                                                                            |
| **Campo `accepts` no registro** + `getToolsForFileType()`                                                                                                                   | O registro continua sendo a fonte única da verdade: ferramenta nova já aparece no roteador quando entra no `tools.ts`, sem lista solta no componente                                                  |
| **Ferramenta `soon` compatível aparece desativada, com "Em breve"**                                                                                                         | Mostra o que está por vir sem link quebrado (mesma regra do menu). Se nenhuma ferramenta `available` aceita o arquivo, aparece um `Alert` explicando e sugerindo outro formato                        |
| **Arquivo passado em memória** (variável de módulo no cliente), com navegação do Next (`router.push`)                                                                       | O `File` continua no mesmo processo da página, sem cópia, base64 ou `sessionStorage` (que tem limite de alguns MB e duplicaria a imagem na memória). Nenhum byte vai para a rede                      |
| **`takePendingFile()` consome o arquivo** (devolve e esvazia o store)                                                                                                       | Voltar à ferramenta depois não reabre uma imagem antiga, e a memória é liberada assim que a ferramenta recebe o arquivo                                                                               |
| **Ao recarregar, o arquivo se perde**                                                                                                                                       | É o esperado de uma ferramenta que não guarda nada. A ferramenta abre no estado inicial ("Escolher imagem"), sem erro                                                                                 |
| **Validação de tamanho e de área na home**, com as mesmas regras da fase de envio e download                                                                                | O erro aparece antes de a pessoa trocar de página, em português e com o que fazer                                                                                                                     |
| **Foco e anúncio depois da escolha:** a lista de ações tem um título ("O que você quer fazer?") que recebe o foco, e uma região `role="status"` anuncia o arquivo escolhido | Quem usa leitor de tela ou teclado sabe que algo mudou e cai direto nas ações                                                                                                                         |
| **Ações como links reais** (`<a href="/png-para-webp">`) com o clique interceptado para gravar o arquivo antes da navegação                                                 | Funciona com teclado e "abrir em nova aba" (a nova aba abre a ferramenta vazia, sem quebrar). O roteamento continua pelo `next/link`                                                                  |
| **Grade como Server Component**                                                                                                                                             | A lista de ferramentas chega pronta no HTML (SEO e links internos), sem JavaScript                                                                                                                    |
| **Sem anúncio `top` na home**; um anúncio `below-tool` depois da grade, com o espaço de segurança                                                                           | O topo é a área de soltar: um anúncio ali empurraria o botão para baixo da dobra ou ficaria perto da área de soltar (política do AdSense). Depois da grade, a pessoa já viu tudo o que a home oferece |
| **JSON-LD `WebSite` + `FAQPage`**                                                                                                                                           | A home é a página do site, e não de uma aplicação: `WebApplication` fica nas páginas das ferramentas. Nada de notas, avaliações ou número de usuários                                                 |
| **Sem bibliotecas novas**                                                                                                                                                   | A área de soltar, a validação e a detecção de tipo vêm da fase de envio e download. O resto é Tailwind, os componentes da fase 02 e `lucide-react`                                                    |

## Tarefas

- [ ] Adicionar `accepts` ao tipo `Tool` e às ferramentas do registro, e criar `getToolsForFileType()` com testes
- [ ] Criar o store `pending-file.ts` (`setPendingFile`, `takePendingFile`) com testes
- [ ] Criar a ilha `ImageRouter`: área de soltar, validação, resumo do arquivo, "Trocar imagem", ações compatíveis e erros
- [ ] Integrar `takePendingFile()` na ilha das ferramentas `available` (no mínimo PNG e JPG para WebP)
- [ ] Criar o `ToolGrid` lido do registro, com o selo "Em breve"
- [ ] Montar a home nova: textos, anúncio, metadados e JSON-LD
- [ ] Incluir o `ToolGrid` no `/styleguide`
- [ ] Testes de componente e E2E (desktop e mobile)
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(ferramentas): adiciona formatos aceitos ao registro de ferramentas`
2. `feat(imagem): adiciona store do arquivo pendente entre páginas`
3. `feat(home): adiciona grade de ferramentas lida do registro`
4. `feat(home): adiciona roteador que sugere ferramentas pelo tipo da imagem`
5. `feat(ferramentas): recebe a imagem escolhida na home`
6. `feat(home): monta a home com texto, anúncio e dados estruturados`
7. `test(e2e): verifica a home e a passagem da imagem para a ferramenta`
8. `docs: registra a home e o roteador de imagem no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 06`

Os testes de unidade e de componente entram no mesmo commit do código.

## Testes

- **Vitest:**
  - `getToolsForFileType()`: PNG → WebP, Compactar e Cortar; HEIC → HEIC para JPG; tipo sem ferramenta → lista vazia; mantém a ordem do registro
  - Todas as ferramentas do registro têm pelo menos um formato em `accepts`
  - `pending-file`: `takePendingFile()` devolve o arquivo uma vez e depois `undefined`; um `setPendingFile()` novo substitui o anterior
- **Testing Library:**
  - Home: um único `h1`, sem outro `<main>`, grade com todas as ferramentas do registro, `soon` sem link e com "Em breve"
  - `ImageRouter`: depois da escolha, mostra nome, tipo e tamanho (por `formatFileSize()`), as ações compatíveis e o foco no título das ações; erro de tipo ou tamanho em `role="alert"`; "Trocar imagem" volta ao estado inicial
- **Playwright (desktop e mobile), com as imagens de `tests/fixtures/`:**
  - Em 360px, `h1` e "Escolher imagem" acima da dobra, sem rolagem horizontal
  - PNG escolhido na home → ações certas → "Converter para WebP" → a página `/png-para-webp` abre com a prévia da imagem, sem escolher de novo → download funciona
  - HEIC escolhido na home mostra só "HEIC para JPG" (desativado com "Em breve" enquanto o conversor de HEIC não fica pronto)
  - Recarregar a ferramenta depois da passagem abre o estado inicial, sem erro
  - **Nenhuma requisição de rede leva o arquivo** (nome, bytes ou base64) durante a escolha na home e a navegação até a ferramenta
  - Distância de pelo menos 48px entre a área de soltar ou as ações e o primeiro anúncio
  - `<head>`: `title`, `description`, `canonical` e JSON-LD (`WebSite` e `FAQPage`)
  - axe sem violações nos temas claro e escuro, antes e depois de escolher a imagem

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] A pessoa escolhe a imagem na home e vê só as ações que servem para aquele tipo de arquivo
- [ ] Ao clicar numa ação, a ferramenta abre com a imagem já carregada, sem nova escolha e sem nenhuma requisição levando o arquivo
- [ ] Ferramentas `soon` aparecem com "Em breve" e sem link, na grade e nas ações
- [ ] No celular, `h1` e "Escolher imagem" acima da dobra, uma coluna, sem rolagem horizontal
- [ ] Anúncio só depois da grade, com espaço de segurança; nenhum anúncio perto da área de soltar ou das ações
- [ ] Texto original (como funciona, privacidade, perguntas frequentes) no HTML, com metadados e JSON-LD
- [ ] axe sem violações nos dois temas
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Print da home:** o rascunho acima é provisório. Se houver um print, ele substitui o layout antes da implementação.
- **Ordem de implementação:** o plano é o 06, mas só pode ser implementado depois de _Criar envio, validação e download de imagens_ (área de soltar e detecção do tipo) e de _Converter PNG e JPG para WebP_ (pelo menos uma ferramenta real para receber o arquivo). Se a fase de SEO ainda não existir, os metadados e o JSON-LD da home entram nela.
- **Anúncio na home:** o plano prevê só um `below-tool`, depois da grade. A alternativa é deixar a home sem anúncio no começo.
- **Texto do `h1`:** proposta "Ferramentas de imagem online e grátis" (palavra-chave ampla). O nome do site continua no header.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
