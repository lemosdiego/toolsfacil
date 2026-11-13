# 05 — Construir layout da página de ferramenta

**Status:** ✅ Concluído · **Branch:** `feat/05-construir-layout-da-pagina-de-ferramenta` · **Depende de:** 04

## Objetivo

Criar o **molde das páginas de ferramenta**, a partir do print do usuário: título, texto curto e botão de envio de um lado, e a prévia da imagem com o ícone de download do outro. O molde já reserva os **espaços dos anúncios do AdSense** (sem script), longe da ferramenta, e a área do texto explicativo que o Google e o AdSense exigem.

Ao final, cada ferramenta (fases 08 a 11) só preenche o molde: o nome, o texto, o botão de envio real e a prévia.

## Referência visual

Print do usuário (desktop), com os anúncios e o texto que o plano acrescenta:

```
┌─────────────────────────────────────────────────────────────┐
│ Logo                                       [ Ferramentas ▾ ] │  header (fase 04)
└─────────────────────────────────────────────────────────────┘

   PNG para WebP  (h1)              ┌──────────────────────┐
                                    │                  [⬇] │  ícone de download
   Texto curto: o que a ferramenta  │                      │
   faz, em 2 ou 3 linhas            │        Imagem        │  prévia
                                    │                      │
   [ Escolher imagem ]                │  1,2 MB → 340 KB     │  tamanho antes/depois
                                    └──────────────────────┘

   ─────────────────── espaço de segurança ────────────────────
   Publicidade
   [            anúncio horizontal (below-tool)            ]
   ─────────────────────────────────────────────────────────────

   Como usar                                    ┌───────────┐
   1. Envie  2. Converta  3. Baixe              │Publicidade│  lateral sticky
                                                │ (sidebar) │  (só desktop)
   [ anúncio no meio do texto (in-content) ]    │           │
                                                │           │
   Perguntas frequentes  ▸ ▸ ▸                  └───────────┘
   Privacidade: nada sai do seu navegador
```

## Escopo

- **Inclui:**
  - **`ToolPageLayout`** (`src/components/tools/`), Server Component, com as áreas:
    - `title` (o `h1`) e `description` (texto curto, 2 ou 3 linhas)
    - `action`: o lugar do botão de envio (o botão real é da fase 07)
    - `preview`: o card da prévia, com o lugar do ícone de download e do tamanho antes e depois
    - `children`: o texto explicativo, em seções `ToolPageSection` (`h2`)
  - **`PreviewCard`**: o card da direita, com o estado vazio (xadrez de transparência sutil e "A prévia aparece aqui") e o estado com imagem. O ícone de download é um `IconButton` com `aria-label` (ex.: "Baixar imagem em WebP")
  - **`AdSlot`** (`src/components/ads/`) com as três posições, a altura reservada e o rótulo "Publicidade", **sem script** (fase 16). Vem da branch da fase 03, já testado
  - **Exemplo vivo** em `/styleguide/ferramenta` (só em dev), com textos e imagem de exemplo, nos dois estados da prévia
  - Atualizar o `CLAUDE.md` (molde da página, posições dos anúncios)
- **Não inclui:**
  - Envio real, validação do arquivo, processamento e download (fase 07). Aqui o botão e a prévia são só visuais, no exemplo do styleguide
  - Rotas das ferramentas (fases 08 a 11)
  - Script do AdSense, consentimento de cookies e anúncios automáticos (fase 16)
  - Metadados de SEO e JSON-LD (fase 06)
  - Layout da home (vem de outro print)

## Decisões técnicas

| Decisão                                                                                                                               | Motivo                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duas colunas a partir de `lg` (1024px)**: texto e botão à esquerda, prévia à direita                                                | Segue o print. Abaixo disso, uma coluna só                                                                                                                              |
| **No celular, a prévia vazia não aparece**                                                                                            | Com ela, o botão de envio poderia cair abaixo da dobra em 360px. A prévia surge logo abaixo do botão quando a pessoa escolhe a imagem                                   |
| **Ícone de download dentro do card, no canto**, como no print                                                                         | O download fica junto da imagem que vai ser baixada. O ícone tem 44px de área de toque e fica desativado até haver imagem pronta                                        |
| **Três posições de anúncio**: `below-tool`, `in-content` e `sidebar`                                                                  | Rendem sem atrapalhar: a ferramenta fica sempre acima, o anúncio só aparece depois que a pessoa já viu o resultado                                                      |
| **`below-tool` com espaço de segurança** (margem grande e divisória) entre a ferramenta e o anúncio                                   | Política do AdSense: nunca colar o anúncio ao botão de envio ou ao ícone de download. Clique sem querer pode suspender a conta                                          |
| **`sidebar` só ao lado do texto explicativo**, sticky, a partir de `lg`                                                               | Ao lado da ferramenta ele espremeria as duas colunas do print e ficaria perto do download. Ao lado do texto, fica visível durante a leitura                             |
| **Sem anúncio fixo no rodapé do celular** (anúncio âncora)                                                                            | Cobre parte da ferramenta numa tela pequena. Fica desligado também nos anúncios automáticos da fase 16                                                                  |
| **Altura reservada (`min-height`) por posição**: 280px no celular e 250px no desktop (`below-tool` e `in-content`), 600px (`sidebar`) | Evita que a página "pule" quando o anúncio carrega (CLS, que pesa no SEO). Ajustável na fase 16 com os tamanhos reais                                                   |
| **`AdSlot` sem `NEXT_PUBLIC_ADSENSE_CLIENT_ID` em produção não ocupa espaço**; em dev mostra um contorno tracejado                    | Segue o `CLAUDE.md`. Dá para ver as posições no `pnpm dev` sem nenhum anúncio real                                                                                      |
| **Texto explicativo abaixo do anúncio**, com perguntas frequentes em `<details>`                                                      | O AdSense recusa páginas com pouco conteúdo, e o texto ajuda no Google. Quem só quer converter nem chega a rolar até ele. `<details>` é nativo e mantém o texto no HTML |
| **Reaproveitar `AdSlot` e `ToolPageLayout` da branch da fase 03**                                                                     | Já foram escritos e testados. O `ToolPageLayout` é adaptado às duas colunas do print                                                                                    |
| **Sem bibliotecas novas**                                                                                                             | Tailwind, os componentes da fase 02 e `lucide-react` resolvem tudo                                                                                                      |

## Responsivo

**Celular (360px), antes de escolher a imagem:**

```
┌──────────────────────────┐
│ Tools Fácil [Ferramentas▾]│
├──────────────────────────┤
│ PNG para WebP     (h1)   │
│ Texto curto em 2 ou 3    │
│ linhas                   │
│ [   Escolher imagem    ]   │  botão com a largura toda, 48px de altura
│                          │  ← tudo isso acima da dobra
│ ─── espaço de segurança ─│
│ Publicidade              │
│ [ anúncio below-tool ]   │
│ Como usar ...            │
└──────────────────────────┘
```

**Celular, depois de escolher a imagem:** a prévia aparece logo abaixo do botão, com a largura toda e o ícone de download no canto. O anúncio continua abaixo dela, com o espaço de segurança.

- Sem rolagem horizontal em 360px; a imagem da prévia se ajusta à largura (`object-contain`) e respeita uma altura máxima.
- Alvos de toque de 44px (botão de envio, ícone de download).
- Sem `sidebar` no celular e no tablet.

**Tablet (`sm`/`md`):** ainda uma coluna, com mais respiro. **Desktop (`lg`+):** as duas colunas do print, e a lateral de anúncio ao lado do texto explicativo.

## Tarefas

- [x] Trazer o `AdSlot` da branch da fase 03 (com os testes) e conferir as alturas e o rótulo
- [x] Criar o `PreviewCard` (estado vazio e com imagem, ícone de download, tamanho antes e depois)
- [x] Criar o `ToolPageLayout` com as duas colunas, as posições de anúncio e o `ToolPageSection`
- [x] Montar o exemplo em `/styleguide/ferramenta`, com os dois estados da prévia
- [x] Testes de componente e E2E (desktop e mobile)
- [x] Atualizar o `CLAUDE.md`
- [x] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(anuncios): adiciona AdSlot com altura reservada e sem script`
2. `feat(ferramentas): adiciona PreviewCard com prévia e ícone de download`
3. `feat(ferramentas): adiciona ToolPageLayout em duas colunas com anúncios`
4. `feat(styleguide): adiciona exemplo da página de ferramenta`
5. `test(e2e): verifica o layout da página de ferramenta e os anúncios`
6. `docs: registra o molde da página de ferramenta no CLAUDE.md`
7. `docs(plans): registra notas da implementação da fase 05`

Os testes de componente entram no mesmo commit do código.

## Testes

- **Testing Library:**
  - `ToolPageLayout` renderiza um único `h1`, a descrição, o `action`, a `preview` e as seções `h2`, e não cria outro `<main>`
  - `AdSlot`: nada sem a variável em produção; contorno com "Publicidade" em dev; altura mínima por posição; `sidebar` escondido abaixo de `lg`
  - `PreviewCard`: estado vazio com o texto de ajuda; com imagem, mostra o tamanho antes e depois; o ícone de download tem nome acessível e fica desativado sem imagem
- **Playwright (desktop e mobile), no `/styleguide/ferramenta`:**
  - No celular (360px), o `h1` e o botão de envio ficam acima da dobra, e não há rolagem horizontal
  - No desktop, texto e prévia ficam lado a lado
  - A distância entre a ferramenta (botão, prévia e ícone de download) e o primeiro anúncio é de pelo menos 48px
  - A lateral de anúncio só aparece a partir de 1024px
  - axe sem violações nos temas claro e escuro, nos dois estados da prévia

## Variáveis de ambiente novas

| Nome                            | Finalidade                                                                 | Onde obter                                            |
| ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Ativa a reserva de espaço dos anúncios. O script em si só entra na fase 16 | Painel do AdSense (`ca-pub-...`), depois da aprovação |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [x] A página de exemplo segue o print: título, texto e botão à esquerda, prévia com ícone de download à direita (desktop)
- [x] No celular, título e botão de envio acima da dobra, uma coluna, sem rolagem horizontal
- [x] Três posições de anúncio com altura reservada, sempre abaixo ou ao lado do texto, nunca coladas ao envio ou ao download
- [x] Área de texto explicativo pronta para "Como usar", perguntas frequentes e privacidade
- [x] axe sem violações nos dois temas
- [x] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Decisões confirmadas

- **Download:** só o ícone tradicional de download (seta para baixo com a bandeja), no canto do card, como no print. Tem `aria-label` e 44px de área de toque.
- **Texto do botão:** "Escolher imagem", o texto padrão proposto no plano.

## Notas da implementação

**Desvios do plano**

- **Botão e prévia na mesma ilha:** os dois dependem do mesmo estado (a imagem escolhida), então não podiam ser duas áreas separadas do layout preenchidas pelo servidor. O `ToolPageLayout` recebe a ilha em `tool`, e ela usa `ToolActionArea` e `ToolPreviewArea`, que se encaixam na grade de duas colunas (o invólucro da ilha usa `display: contents`). Título e texto continuam no servidor, para o SEO.
- **`formatFileSize` e `formatSizeChange`** (`src/lib/image/`), com testes, para o tamanho antes e depois da prévia. Base 1024, vírgula decimal e sem ponto de milhar ("1023 B", não "1.023 B"). Commit próprio, fora da lista prevista.
- **Utilitário `bg-checkerboard`** no `globals.css`, como fundo da prévia (mostra as áreas transparentes da imagem). Usa os tokens `surface` e `surface-muted`.
- **`in-content` só quando há mais de uma seção:** o layout coloca o anúncio depois da primeira `ToolPageSection`. Com uma seção só, ele não aparece.
- **Texto de apoio abaixo do botão** no exemplo ("PNG até 20 MB. A imagem não sai do seu aparelho."), para reforçar a privacidade. O texto real de cada ferramenta vem na fase dela.
- A imagem de exemplo do styleguide é um SVG embutido (`data:`): nada é carregado de fora.

**Ajustes pedidos pelo usuário na revisão**

- **Anúncio no topo** (`top`): faixa de 90px entre o header e a ferramenta, só no desktop, a 48px da prévia (que tem o ícone de download). No celular ele empurraria o botão "Escolher imagem" para baixo da dobra, então fica de fora.
- O usuário testou o header e a página com outras larguras e preferiu manter como estava: header na largura toda da tela e página na largura do conteúdo (`max-w-content`).

**Testes:** 103 de unidade e componente; E2E com 60 testes em dev e 30 no build de produção (desktop e mobile), incluindo título e botão acima da dobra em 360px, distância mínima de 48px até o primeiro anúncio, lateral só a partir de 1024px e axe nos dois temas e nos dois estados da prévia.

**Pendências**

- As alturas do `AdSlot` são estimativas: ajustar na fase 16 com os tamanhos reais servidos.
- O botão "Escolher imagem" real (seletor de arquivo, validação e download) entra na fase 07.
