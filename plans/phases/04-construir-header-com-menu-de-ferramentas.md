# 04 — Construir header com menu de ferramentas

**Status:** 📝 Rascunho · **Branch:** `feat/04-construir-header-com-menu-de-ferramentas` · **Depende de:** 02

## Objetivo

Substituir a fase 03 (descartada) por uma entrega menor e mais prática, a partir do layout desenhado pelo usuário: um **header enxuto** com o logo e um botão **"Ferramentas ▾"** que abre um **menu suspenso com as ferramentas agrupadas por categoria**.

A ideia do site muda: o usuário chega e já usa a ferramenta, sem home cheia de seções. Esta fase entrega só a navegação. O molde da página de ferramenta vem na fase 05, e a home num próximo print.

## Referência visual

Print do usuário (desktop):

```
┌─────────────────────────────────────────────────────────┐
│  Logo                                 [ Ferramentas ▾ ] │  header
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Converter          Editar              Em breve...     │  menu aberto
│  PNG para WebP      Compactar imagem                    │
│  JPG para WebP      Cortar imagem                       │
│  HEIC para JPG                                          │
└─────────────────────────────────────────────────────────┘
```

## Escopo

- **Inclui:**
  - **Nome do site:** "Tools Fácil" em `src/lib/site-config.ts` (única fonte no código).
  - **Registro das ferramentas** (`src/lib/tools.ts`) com as **categorias do menu** (ver "Decisões técnicas") e funções de consulta, com testes.
  - **`SiteHeader`** (`src/components/layout/`): logo em texto (nome do `site-config`, link para a home) à esquerda e o botão "Ferramentas ▾" à direita.
  - **`ToolsMenu`**: o painel suspenso com uma coluna por categoria, lido do registro.
  - **`SkipLink`** ("Pular para o conteúdo") e o `<main id="conteudo">` no layout raiz.
  - **Responsivo** do header e do menu em 360px, tablet e desktop (ver "Responsivo").
  - Exemplo do header e do menu no `/styleguide`.
  - Atualizar o `CLAUDE.md`: remover home em seções, `ToolPageLayout`, `ToolCard` e `AdSlot` (que eram da fase 03), registrar as categorias e o menu, e corrigir os números das fases depois da renumeração do roteiro.
- **Não inclui:**
  - Home com cards, hero, FAQ e seções da fase 03. A home continua com o conteúdo atual (`h1` e descrição), só sem o próprio `<main>`. O novo layout da home vem de um próximo print.
  - Footer (entra com as páginas institucionais, fase 12).
  - Layout da página de ferramenta e espaços de anúncio (`AdSlot`): fase 05.
  - Logo de verdade (fase 14, identidade visual).
  - SEO, sitemap e CSP (fase 06).

## Decisões técnicas

| Decisão                                                                                                    | Motivo                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duas categorias: `convert` ("Converter") e `edit` ("Editar")**                                           | Segue o print. Compactar e cortar não trocam o formato, então ficam juntas em "Editar". Os nomes no código ficam em inglês e os rótulos em português, num mapa `categoryLabels`                                                    |
| **PNG para WebP e JPG para WebP como duas ferramentas** (`/png-para-webp` e `/jpg-para-webp`)              | O print lista as duas separadas, e cada uma é uma busca própria no Google. Nenhuma rota foi publicada ainda, então trocar o `converter-webp` não quebra o SEO. As duas vão compartilhar o mesmo componente de conversão na fase 08 |
| **Ferramenta não pronta aparece na coluna dela, sem link, com o badge "Em breve"**                         | Mantém o desenho do print desde já e evita links quebrados. Quando a fase da ferramenta termina, basta trocar o `status` para `available`                                                                                          |
| **Terceira coluna "Em breve..." com uma frase curta** ("Novas ferramentas chegando"), sem nomes inventados | Mostra que o site vai crescer sem prometer ferramentas que não estão no roteiro. Quando houver uma ferramenta nova planejada, ela entra no registro e aparece na coluna da categoria dela                                          |
| **Menu com a Popover API nativa** (`popover` + `popovertarget`)                                            | Abre e fecha sem estado React. Esc, clique fora e a devolução do foco ao botão já vêm do navegador, e o `aria-expanded` do botão é automático                                                                                      |
| **Abre no clique (ou toque), não no hover**                                                                | O hover não existe no celular e fecha sem querer quando o mouse escapa do painel. Um único comportamento em todas as telas                                                                                                         |
| **Ilha `"use client"` mínima para fechar o menu ao navegar**                                               | O layout do Next persiste entre as rotas. Sem ela, o menu ficaria aberto depois de clicar numa ferramenta                                                                                                                          |
| **Painel posicionado com `position: fixed` logo abaixo do header**                                         | O CSS Anchor Positioning ainda não funciona em todos os navegadores. O painel tem a mesma largura do header (`max-w-content`), como no print                                                                                       |
| **Setinha do botão gira com o menu aberto** (`:has(+ :popover-open)`)                                      | Mostra o estado sem JavaScript. Sem animação com `prefers-reduced-motion`                                                                                                                                                          |
| **Reaproveitar o código da branch da fase 03**                                                             | O registro, o `SkipLink`, o item do menu e a ilha de fechar já foram escritos e testados. Eles vêm de lá e são adaptados ao novo desenho, sem retrabalho                                                                           |
| **Sem bibliotecas novas**                                                                                  | Tailwind, os componentes da fase 02, `lucide-react` e APIs nativas resolvem tudo                                                                                                                                                   |

## Responsivo

O mesmo botão "Ferramentas ▾" em todas as larguras (sem menu "hambúrguer"), porque a navegação do site é só a lista de ferramentas.

**Celular (360px):**

```
┌──────────────────────────┐
│ Tools Fácil [Ferramentas▾]│  header (não fixo: libera altura para a ferramenta)
├──────────────────────────┤
│ CONVERTER                │  menu aberto: uma coluna,
│  PNG para WebP           │  largura da tela menos 16px de cada lado
│  JPG para WebP           │
│  HEIC para JPG           │  cada item com 44px de altura (alvo de toque)
│ EDITAR                   │
│  Compactar imagem        │
│  Cortar imagem           │
│ EM BREVE                 │
│  Novas ferramentas...    │
└──────────────────────────┘
```

- Itens com no mínimo 44px de altura e a linha inteira clicável.
- Altura máxima de `100dvh` menos o header, com rolagem interna se a lista crescer. A página atrás não rola.
- Nome do site e botão cabem lado a lado em 360px, sem quebra de linha nem rolagem horizontal.

**Tablet (a partir de `sm`, 640px):** duas colunas (Converter | Editar), com "Em breve" embaixo.

**Desktop (a partir de `lg`, 1024px):** três colunas, como no print. O header fica sticky e discreto.

## Tarefas

- [ ] Trazer da branch da fase 03 o registro, o `SkipLink`, o `ToolMenuItem` e a ilha `ClosePopoverOnNavigate`
- [ ] Aplicar o nome "Tools Fácil" em `site-config.ts` (e nos testes que leem o nome)
- [ ] Ajustar o registro: categorias `convert`/`edit`, separar PNG e JPG para WebP, remover o `featured`, e escrever os testes
- [ ] Criar `SiteHeader` e `ToolsMenu` com as colunas por categoria e o responsivo
- [ ] Aplicar `SkipLink`, `SiteHeader` e `<main id="conteudo">` no `layout.tsx`, e tirar o `<main>` da home
- [ ] Adicionar o header e o menu ao `/styleguide`
- [ ] Testes de unidade, de componente e E2E (desktop e mobile)
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(config): adota o nome Tools Fácil`
2. `feat(ferramentas): cria registro das ferramentas com categorias do menu`
3. `feat(layout): adiciona link de pular e main no layout raiz`
4. `feat(layout): adiciona header com menu de ferramentas por categoria`
5. `feat(styleguide): adiciona exemplo do header e do menu`
6. `test(e2e): verifica o menu de ferramentas no desktop e no mobile`
7. `docs: registra header, menu e categorias no CLAUDE.md`
8. `docs(plans): registra notas da implementação da fase 04`

Os testes de unidade e de componente entram no mesmo commit do código.

## Testes

- **Vitest (registro):** slugs únicos, em kebab-case e sem acentos; toda ferramenta tem nome, ícone e uma categoria com rótulo; `getToolsByCategory` devolve as ferramentas na ordem do registro; `getAvailableTools` só devolve `available`.
- **Testing Library:**
  - `ToolsMenu` mostra uma coluna por categoria, com o título e as ferramentas dela, e a coluna "Em breve"
  - Ferramenta `soon` não tem `href` e mostra "Em breve"; `available` vira link para `/slug`
  - O botão tem nome acessível ("Ferramentas") e `popovertarget` apontando para o painel
- **Playwright (desktop e mobile):**
  - O menu abre no clique (no toque, no mobile), mostra as categorias e fecha com Esc e com clique fora; o foco volta ao botão
  - No mobile (360px), o menu ocupa uma coluna, os itens têm pelo menos 44px de altura e não há rolagem horizontal, com o menu aberto ou fechado
  - No desktop, as três colunas ficam lado a lado
  - O link de pular é o primeiro foco e leva ao `main`
  - axe sem violações na home, com o menu aberto e fechado, nos temas claro e escuro

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] O header e o menu seguem o print: logo à esquerda, "Ferramentas ▾" à direita, colunas Converter, Editar e Em breve
- [ ] O menu lê as ferramentas só do `tools.ts` (nenhuma lista solta)
- [ ] Ferramentas `soon` não geram links
- [ ] Menu acessível pelo teclado e pelo toque (abre, fecha com Esc e clique fora, foco volta ao botão) e fecha ao navegar
- [ ] Sem rolagem horizontal em 360px; alvos de toque de 44px
- [ ] axe sem violações nos dois temas
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos a confirmar

- **Coluna "Em breve...":** o plano usa uma frase curta, sem nomes de ferramentas. Se a ideia era listar ali as ferramentas ainda não prontas (em vez de deixá-las na coluna da categoria com o badge), é só avisar.
- **PNG e JPG para WebP em rotas separadas:** confirmar que são duas páginas (`/png-para-webp` e `/jpg-para-webp`).

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
