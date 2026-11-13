# CLAUDE.md — Tools Fácil

> **Idioma:** responda sempre em **português (pt-BR)**: respostas, planos, commits, PRs e comentários no código.

## Visão geral

Hub de **micro-ferramentas** (_single-purpose tools_): cada página resolve um problema do dia a dia em segundos (converter, cortar, compactar uma imagem) e entrega o download na hora. O público são usuários comuns, designers e desenvolvedores, que chegam pela busca do Google.

Três princípios guiam todas as decisões:

- **Agilidade:** o usuário entra, resolve e baixa. Sem cadastro, sem etapas desnecessárias.
- **Privacidade:** os arquivos **nunca saem do navegador**. Todo processamento é _client-side_.
- **Custo zero de infraestrutura:** site estático/serverless, sem servidor processando arquivos.

> O nome do projeto é **Tools Fácil** (domínio sugerido: `toolsfacil.com.br`). Não espalhe o nome pelo código: o nome vem só de `src/lib/site-config.ts`, e a URL só de `getSiteUrl()` (`src/lib/seo.ts`).

### Escopo do MVP

1. **Conversores de imagem**, cada um com rota própria para o SEO: PNG para WebP (`/png-para-webp`), JPG para WebP (`/jpg-para-webp`) e HEIC para JPG (`/heic-para-jpg`).
2. **Cortador e redimensionador** (`/cortador-de-imagem`): corte livre, proporções prontas (redes sociais) e redimensionamento.
3. **Compactador de imagens** (`/compactar-imagem`): redução de KB sem perda visual perceptível.
4. **Layout enxuto:** o usuário chega e já usa a ferramenta, sem home cheia de seções. A navegação é o header com o menu "Ferramentas". Cada tela nasce de um print do usuário (ver "Referências visuais").
5. **Páginas institucionais** exigidas pelo AdSense: Sobre, Contato, Política de Privacidade e Termos de Uso.

### Fora do escopo (não implementar sem pedido explícito)

- Qualquer upload de arquivo do usuário para servidor, API ou serviço externo.
- Cadastro, login ou contas de usuário.
- Banco de dados.
- Pagamentos via Pix (planejado para o futuro, ver "Monetização").

## Monetização

- **Google AdSense:** banners de display com receita do tráfego orgânico. É a única fonte de receita do MVP.
- **Pix avulso (futuro):** pacotes de uso ou recursos avançados pagos na hora, **sem assinatura**. Os webhooks ficarão em `src/app/api/`. Só comece quando o usuário pedir, com plano próprio.

## Stack

| Camada    | Tecnologia                                                                   |
| --------- | ---------------------------------------------------------------------------- |
| Framework | Next.js (App Router) + TypeScript (`strict`)                                 |
| Estilos   | Tailwind CSS                                                                 |
| Mídia     | Cropper.js + APIs nativas (`Canvas`, `OffscreenCanvas`, `createImageBitmap`) |
| Deploy    | Vercel (ver "Pontos em aberto": plano gratuito e uso comercial)              |
| Pacotes   | **pnpm** (nunca usar npm ou yarn)                                            |
| Testes    | Vitest + Testing Library (unitário e componentes), Playwright (E2E)          |
| Qualidade | ESLint + Prettier                                                            |

## Comandos

```bash
pnpm install              # instalar dependências
pnpm dev                  # servidor de desenvolvimento (http://localhost:3000)
pnpm build                # build de produção
pnpm start                # rodar o build

pnpm lint                 # ESLint
pnpm format               # Prettier (escreve)
pnpm format:check         # Prettier (só verifica, usado no CI)
pnpm typecheck            # tsc --noEmit

pnpm test                 # Vitest (execução única)
pnpm test:watch           # Vitest em modo watch
pnpm test:e2e             # Playwright (desktop + mobile; sobe o next dev sozinho)
pnpm exec playwright install chromium   # baixar o navegador (só na primeira vez)
```

> Antes de abrir um PR, rode `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` e `pnpm test:e2e`. Todos devem passar. Quando houver CI, ele roda os mesmos comandos em todo PR.
>
> Os comandos acima são o alvo: os scripts são criados na fase de setup do projeto.

## Estrutura de pastas (proposta)

```
src/
  app/
    (tools)/
      png-para-webp/        # uma pasta por ferramenta (rota = slug de SEO)
      jpg-para-webp/
      heic-para-jpg/
      cortador-de-imagem/
      compactar-imagem/
    (institutional)/
      sobre/
      contato/
      politica-de-privacidade/
      termos-de-uso/
    api/                    # route handlers (futuro: webhooks do Pix)
    layout.tsx              # SkipLink, header, <main> e script do AdSense
    page.tsx                # home (roteador de imagem, fase 06)
    not-found.tsx           # 404: toda URL sem rota (e ferramenta "soon")
    error.tsx               # erro inesperado, com "Tentar de novo"
    global-error.tsx        # erro no próprio layout raiz (documento mínimo)
    opengraph-image.tsx     # imagem de compartilhamento, gerada no build
    sitemap.ts              # páginas fixas + ferramentas "available"
    robots.ts
  components/
    ui/                     # componentes genéricos (Button, Card...)
    layout/                 # SkipLink, SiteHeader, ToolsMenu (Footer depois)
    ads/                    # AdSlot
    seo/                    # JsonLd
    tools/                  # ToolPageLayout, FileDropzone, DownloadButton...
  lib/
    tools.ts                # registro único das ferramentas (fonte da verdade)
    site-config.ts          # nome, frase e textos do site
    site-pages.ts           # páginas fixas do sitemap
    seo.ts                  # URLs absolutas e metadados das páginas
    structured-data.ts      # montadores de JSON-LD
    security-headers.ts     # CSP e cabeçalhos (lidos pelo next.config.ts)
    image/                  # funções puras de cálculo e processamento
  workers/                  # Web Workers de processamento de imagem
  types/
public/
  ads.txt                   # exigido pelo AdSense
tests/
  e2e/                      # Playwright
  fixtures/                 # imagens de teste (PNG, JPG, HEIC, WebP)
```

Testes unitários ficam ao lado do arquivo testado (`*.test.ts` / `*.test.tsx`).

### Referências visuais (somente local)

```
referencias/
  projeto/              # prints de telas/layout
  identidade-visual/    # logo, paleta, fontes, moodboard
```

- A pasta fica no `.gitignore`: **nunca** a adicione ao repositório nem a referencie no código.
- Consulte essas imagens antes de implementar ou alterar qualquer interface.

## Convenções de código

> **Next.js:** antes de usar uma API do Next, consulte a documentação local em `node_modules/next/dist/docs/` (quando existir), porque ela pode ser diferente do que você conhece. Se o `next dev` gerar um `AGENTS.md`, siga-o e não edite o bloco gerenciado.

- TypeScript `strict`; evite `any`.
- Nomes de código (variáveis, funções, arquivos, componentes) em **inglês**; textos da interface em **português (pt-BR)**.
  - **Exceção:** os segmentos de rota são slugs de SEO e ficam em português (`cortador-de-imagem`), porque fazem parte da URL que o usuário busca.
- Prefira **Server Components** para o conteúdo da página (título, texto explicativo, FAQ), que precisa chegar pronto no HTML para o SEO. A parte interativa da ferramenta é uma **ilha `"use client"`** dentro da página.
- Constantes exportadas de um arquivo `"use client"` não chegam como valor aos Server Components: deixe-as em um arquivo comum.
- Classes condicionais via `cn()` (`src/lib/cn.ts`). Reaproveite os componentes de `src/components/ui/` antes de criar estilos novos.
- Use os tokens semânticos do Tailwind definidos em `globals.css` (ex.: `bg-surface`, `text-muted`), e nunca hex soltos nos componentes (única exceção: `opengraph-image.tsx`, porque o `ImageResponse` não lê as variáveis CSS). A identidade visual ainda não foi definida (ver "Pontos em aberto").

### Tokens e componentes base

Referência visual de tudo em **`/styleguide`** (só em `pnpm dev`; responde 404 em produção). Ao criar um componente genérico novo, inclua-o lá.

- **Cores** (`bg-*`, `text-*`, `border-*`), com valores para o tema claro e o escuro (segue o `prefers-color-scheme`, sem botão de troca):
  - Superfícies: `background` (página), `surface` (cards), `surface-muted` (áreas secundárias, hover)
  - Texto: `foreground` (principal), `muted` (secundário)
  - Bordas: `line` (decorativa), `line-strong` (controles, contraste 3:1)
  - Ação: `primary`, `primary-hover`, `on-primary` (texto sobre o primary), `ring` (foco)
  - Estados: `info`, `success`, `danger` e as versões `*-soft` para fundos
- A paleta padrão do Tailwind (`zinc`, `gray`, `blue`...) está **desligada**: só os tokens geram classes.
- **Raios:** `rounded-control` (botões, campos, alertas) e `rounded-card`. **Sombras:** `shadow-card` e `shadow-raised`. **Larguras:** `max-w-content` (layout) e `max-w-prose` (texto longo).
- Raio, sombra ou largura nova no `@theme` também entra em `src/lib/cn.ts`, para o `tailwind-merge` resolver os conflitos.
- **Fonte:** Inter (`font-sans`), auto-hospedada pelo `next/font`. Use `tabular-nums` em tamanhos e dimensões.
- **Ícones:** `lucide-react`, importados um a um (já saem com `aria-hidden`).
- **Componentes** (`src/components/ui/`, todos Server Components):
  - `Container` (larguras `content`/`prose`) e `Heading` (`level` 1–3, `size` visual independente)
  - `Button` (`primary`/`secondary`/`ghost`, `md`/`lg`, `loading`; com `href` vira link) e `IconButton` (`aria-label` obrigatório, 44px)
  - `Card`, `Badge` (`neutral`/`info`/`success`/`danger`) e `Alert` (`info`/`success` com `role="status"`, `error` com `role="alert"`)
  - `Spinner` (com `label`, é anunciado), `ProgressBar` (`role="progressbar"`, 0–100) e `VisuallyHidden`
- **Acessibilidade nos testes:** o helper `tests/e2e/accessibility.ts` roda o axe (WCAG 2.1 AA, inclui contraste). Toda página nova passa por ele nos temas claro e escuro.

### Registro das ferramentas (`src/lib/tools.ts`)

- **Fonte única da verdade** para slug, nome (curto, mostrado no menu), descrição curta, categoria e status de cada ferramenta.
- O menu (e depois o `sitemap.ts`) lê desse registro. **Uma ferramenta nova entra nele**, e nunca em listas soltas pelos componentes.
- **Categorias** (`toolCategories`, na ordem das colunas do menu): `convert` ("Converter") e `edit` ("Editar"). Categoria nova entra nessa lista, com o rótulo em português.
- **Status:** `soon` aparece no menu com o selo "Em breve", **sem link** (nada de link quebrado). Ao terminar a fase da ferramenta, troque para `available`: só então ela vira link (e entra no sitemap).
- Consultas prontas: `getToolsByCategory()`, `getAvailableTools()`, `getToolBySlug()` e `getToolHref()`.

### Mapa de rotas

Toda tela do site está neste mapa. **Rota nova só entra depois de entrar aqui** (o plano da fase traz a linha nova).

| Rota                                                               | Tela                        | Layout                           | Sitemap                 |
| ------------------------------------------------------------------ | --------------------------- | -------------------------------- | ----------------------- |
| `/`                                                                | Home (roteador de imagem)   | Próprio                          | Sim                     |
| `/<slug>` de cada ferramenta do `tools.ts`                         | Ferramenta                  | `ToolPageLayout`                 | Só quando `available`   |
| `/sobre`, `/contato`, `/politica-de-privacidade`, `/termos-de-uso` | Institucional               | Texto longo (`max-w-prose`)      | Sim                     |
| Qualquer outra URL                                                 | Página não encontrada (404) | `not-found.tsx`                  | Não (`noindex` do Next) |
| Erro inesperado                                                    | Erro                        | `error.tsx` / `global-error.tsx` | Não                     |
| `/styleguide`, `/styleguide/*`                                     | Referência visual (só dev)  | Próprio                          | Não (404 em produção)   |

- **As ferramentas vêm do `tools.ts`:** o mapa não repete slugs nem nomes. Uma ferramenta `soon` **não tem rota** (responde 404): a página nasce junto com a ferramenta pronta, nunca como "Em breve".
- **Rotas que não são telas:** `/sitemap.xml` e `/robots.txt` (gerados), `/ads.txt` (`public/`) e `/api/*` (futuro, webhooks do Pix).
- **Navegação:** header (home e menu "Ferramentas"), footer com as páginas institucionais (fase das institucionais) e a 404 (home e lista de ferramentas).
- **Contato sem formulário:** só e-mail, vindo do `site-config.ts` (formulário exigiria servidor ou serviço externo).
- **Erros:** as telas de erro não registram nem enviam o erro para fora (a mensagem pode ter o nome do arquivo do usuário). Erro esperado (arquivo inválido, grande demais) é tratado dentro da ferramenta, com `Alert`.
- **Fora do MVP:** páginas de categoria (`/converter`, `/editar`) e "Todas as ferramentas", só quando houver ferramentas suficientes por grupo.

### Layout e header

- O layout raiz já tem `SkipLink`, `SiteHeader` e `<main id="conteudo">`. **As páginas não criam outro `<main>`.**
- **Header** na largura toda da tela: nome do site à esquerda (logo provisório em texto) e o botão "Ferramentas ▾" à direita. Não é fixo no celular; sticky a partir de `lg`.
- **Menu de ferramentas** (`ToolsMenu`): painel na largura toda, com uma coluna por categoria e a coluna "Em breve". Uma coluna no celular; a partir de `sm`, colunas lado a lado com a largura do conteúdo.
  - Usa a **Popover API** nativa (`popover` + `popoverTarget`): toque e teclado abrem pelo botão; Esc e clique fora fecham.
  - Com o **mouse, abre ao passar por cima** (ilha `OpenPopoverOnHover`) e fecha ao sair do botão e do painel. O clique depois do hover não fecha.
  - A ilha `ClosePopoverOnNavigate` fecha o menu quando a rota muda (não no carregamento).
  - No celular, a página atrás não rola com o menu aberto (`data-scroll-lock-mobile`).

### Página de ferramenta

- Toda página de ferramenta usa o **`ToolPageLayout`** (`src/components/tools/`): `title` (o `h1`), `description` (2 ou 3 linhas), `tool` (a ilha `"use client"`) e o texto em `ToolPageSection` (`h2`). Exemplo vivo em `/styleguide/ferramenta` (só em dev).
- **Desktop:** título, texto e botão à esquerda, prévia à direita. **Celular:** uma coluna, com título e botão acima da dobra.
- A ilha renderiza o botão dentro de `ToolActionArea` e a prévia dentro de `ToolPreviewArea`, que se encaixam na grade. Use `hiddenOnMobile` na prévia enquanto não há imagem.
- **`PreviewCard`:** imagem sobre o xadrez de transparência, ícone de download tradicional no canto (desativado até haver resultado, com `aria-label` como "Baixar imagem em WebP") e tamanho antes e depois.
- **A ilha de uma ferramenta de imagem** usa `useImageTool()` + `ImageToolView` (`src/components/tools/`) e só diz **o que aceita** e **o que faz**:
  ```tsx
  const tool = useImageTool({
    accepts: getToolBySlug("png-para-webp")!.accepts,
    process: (file) => processImage(file, { type: "image/webp", quality: 0.8 }),
    getFileName: (file) => getOutputFileName(file.name, { extension: "webp" }),
  });
  return <ImageToolView tool={tool} accepts={...} outputLabel="WebP" previewAlt="..." controls={...} />;
  ```
  - `useImageTool`: estados `idle → checking → processing → done | error`, validação, URLs `blob:` (revogadas), encerramento do worker ao sair, `reprocess()` para mudar uma opção (ex.: qualidade) e `reset()`.
  - `ImageToolView`: botão, `accept` do seletor, aviso de privacidade, erros com o que fazer (e link para a ferramenta sugerida, quando pronta), arrastar e soltar em qualquer parte da página (desktop) e a prévia com download e tamanhos. Opções da ferramenta entram em `controls`.
- O botão de envio diz **"Escolher imagem"** (depois, "Escolher outra imagem"). Nunca "enviar" ou "upload": o arquivo não sai do aparelho.
- Tamanhos de arquivo só por `formatFileSize()` e `formatSizeChange()` (`src/lib/image/format-file-size.ts`).

### Processamento de imagem (client-side)

- **Regra de ouro:** nenhum byte do arquivo do usuário sai do navegador. Nunca envie arquivo, `Blob`, base64 ou nome do arquivo para `fetch`, API, analytics ou log.
- **Lógica separada da interface:** cálculos (proporções, dimensões, nome do arquivo de saída, formatação de KB) ficam em funções puras em `src/lib/image/`, com testes. Os componentes só chamam essas funções.
- **Peças prontas (`src/lib/image/`):**
  - `inspectImageFile()` lê só os primeiros 256 KB: tipo real (`detectImageType()`, pelos bytes) e dimensões (`readImageDimensions()`, pelo cabeçalho, sem decodificar).
  - `validateImage(inspection, accepts)`: tamanho, tipo e dimensões, com mensagem em português e a ferramenta sugerida (`getToolsForFileType()`). Limites em `image-limits.ts`: **20 MB**, **16.777.216 pixels** (4096 × 4096, teto do iOS) e **16.384 px** de lado.
  - `processImage(file, { type, quality })`: decodifica com a orientação do EXIF, desenha e codifica. Roda no **Web Worker** (`src/workers/image.worker.ts`, com `OffscreenCanvas`) e cai na thread principal se o navegador não suporta ou o worker não carrega. JPG ganha fundo branco.
  - `canEncode(type)`: o navegador gera o formato pelo canvas? (o Safari não gera WebP). Se o formato devolvido não for o pedido, `processImage` dá erro, nunca um arquivo com a extensão errada.
  - `getOutputFileName(nome, { extension, suffix })`: `foto.webp`, `foto-cortada.jpg`, ou `imagem.webp` sem nome aproveitável.
  - Formatos (`image-formats.ts`): rótulo, extensões, `getAcceptAttribute()` e `formatTypeList()` ("PNG ou JPG").
- **Formatos aceitos** vêm do `accepts` da ferramenta no `tools.ts`, nunca de uma lista na página.
- **Worker no build:** o Turbopack compila o worker em `turbopack-worker-*.js`, e também copia o `.ts` original para `static/media` por causa do `new URL(...)`. Essa cópia não é usada.
- **Bibliotecas pesadas sob demanda:** o decodificador de HEIC e qualquer WASM são carregados com `import()` dinâmico, só na página que usa e só quando o usuário escolhe um arquivo. Nunca no bundle global.
- **Metadados:** a saída é regravada pelo canvas, e com isso perde o EXIF (inclusive GPS). O `ImageToolView` já avisa isso na interface.
- **Memória:** chame `URL.revokeObjectURL()` em toda URL criada, e `bitmap.close()` depois de usar (o `useImageTool` e o `processImage` já fazem).
- **Uma imagem por vez:** soltar vários arquivos abre o primeiro, com aviso.
- **Lote (quando houver):** processe um arquivo por vez e baixe em `.zip` com uma biblioteca leve, carregada sob demanda.

### Performance

- Meta: **Lighthouse ≥ 90** em mobile nas páginas de ferramenta. Core Web Vitals importam para o SEO.
- Antes de instalar uma dependência, verifique o peso dela (ex.: bundlephobia) e se uma API nativa resolve. Instalação fora do plano pede confirmação.
- O script do AdSense carrega com `next/script` e `strategy="afterInteractive"` (ou `lazyOnload`), nunca bloqueando a renderização.

### Anúncios (AdSense)

- Banners só pelo componente `AdSlot` (`src/components/ads/`), que lê o ID de `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. **Sem a variável, nenhum anúncio aparece** (padrão em dev e nos testes).
- **Reserve a altura** do espaço do anúncio (`min-height`) para não causar CLS.
- **Políticas do AdSense:** nunca coloque um anúncio colado ao botão de download ou à área de soltar arquivo, nem de um jeito que pareça parte da ferramenta. Clique acidental pode suspender a conta.
- Posições do `AdSlot`, já colocadas pelo `ToolPageLayout` (não espalhe `AdSlot` nas páginas de ferramenta):
  - `top`: entre o header e a ferramenta, faixa de 90px, só a partir de `lg` (no celular empurraria o botão para baixo da dobra), a 48px da ferramenta.
  - `below-tool`: abaixo da ferramenta, depois de um espaço de segurança com divisória (pelo menos 48px). 280px no celular, 250px no desktop.
  - `in-content`: no meio do texto, depois da primeira `ToolPageSection`. Mesmas alturas.
  - `sidebar`: ao lado do texto (nunca da ferramenta), sticky, 600px, só a partir de `lg`.
- Sem anúncio fixo no rodapé do celular (anúncio âncora). A ferramenta nunca fica abaixo da dobra por causa de anúncio.
- Em dev, sem a variável, o `AdSlot` mostra um contorno tracejado para visualizar a posição.
- `public/ads.txt` com a linha do publisher, preenchida pelo usuário.

### SEO (`src/lib/seo.ts`)

- **Metadados só pelo `seo.ts`:** a página de ferramenta exporta `createToolMetadata(tool, { title, description })`, e as outras páginas `createPageMetadata({ title, description, path })`. Os dois geram `title`, `description`, `alternates.canonical` e `openGraph` a partir do `baseOpenGraph`. Nunca monte `openGraph` à mão: o da página substitui o do layout inteiro, sem mesclar.
- **Título:** o layout aplica o modelo `%s | Tools Fácil`. A página passa só o próprio título (`absoluteTitle: true` para usar sem o sufixo, como na home).
- **Conteúdo textual em cada página de ferramenta** (Server Component, abaixo da ferramenta): o que é, como usar (passo a passo), perguntas frequentes e um aviso de privacidade. Texto original e útil, nunca encheção: o AdSense recusa sites com pouco conteúdo.
- **Dados estruturados** só pelo componente `JsonLd` (`src/components/seo/`), que escapa o `<`, com os montadores de `src/lib/structured-data.ts`: `webApplicationJsonLd()` e `faqPageJsonLd()` nas ferramentas, `webSiteJsonLd()` na home. As perguntas do `FAQPage` são as mesmas do texto. Nunca invente avaliações, notas ou número de usuários.
- **Endereços:** `getSiteUrl()` e `absoluteUrl()` a partir de `NEXT_PUBLIC_SITE_URL`. **No build de produção, sem a variável, o build falha** (para os robôs nunca receberem `localhost`). Em dev, o padrão é `http://localhost:3000`.
- **Imagem de compartilhamento:** `src/app/opengraph-image.tsx`, gerada no build, vale para todas as páginas. A arte final vem com a identidade visual.
- `sitemap.ts` lista as páginas fixas de `site-pages.ts` (página institucional nova entra lá) e as ferramentas `available`; `robots.ts` libera tudo, menos `/api/`.
- Um `h1` por página, com a palavra-chave principal (ex.: "Converter imagem para WebP").

### Responsividade e acessibilidade

- **Mobile first:** a maior parte do tráfego vem do celular. Teste em 360px de largura.
- Área de soltar arquivo também abre o seletor ao toque; no celular, aceite a câmera/galeria.
- Contraste AA, `aria-label` em botões só com ícone, alvos de toque de 44px, decoração com `aria-hidden`.
- Estados claros: carregando, erro (em português e com o que fazer), concluído.

### Segurança

- **Cabeçalhos e CSP** montados em `src/lib/security-headers.ts` (função pura, com testes) e aplicados pelo `next.config.ts` em todas as respostas, inclusive em dev.
- **CSP sem nonce** (`script-src 'self' 'unsafe-inline'`): com nonce, toda página teria de ser renderizada no servidor a cada visita, sem página estática nem cache. Não troque sem plano próprio.
- O resto é restrito: `default-src 'self'`, `connect-src 'self' blob:`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri` e `form-action` só do site. `img-src` aceita `blob:` e `data:` (prévias locais), e `worker-src` aceita `'self'` e `blob:`. Em dev, entram `'unsafe-eval'` e `ws:`.
- **Um serviço externo novo** precisa entrar na política. Os domínios do AdSense (`script-src`, `img-src`, `frame-src`, `connect-src`) entram na fase do AdSense, junto com o script real.
- O teste E2E `security-headers.spec.ts` falha com qualquer violação de CSP: página nova entra na lista dele.
- Nunca use `dangerouslySetInnerHTML` fora do `JsonLd` (a regra `react/no-danger` do ESLint bloqueia).

### Privacidade e LGPD

- A **Política de Privacidade** explica que os arquivos não saem do dispositivo, e que o AdSense usa cookies para anúncios. É obrigatória para a aprovação do AdSense.
- Banner de consentimento de cookies antes de anúncios personalizados (o Google exige uma CMP certificada para visitantes do Espaço Econômico Europeu e do Reino Unido).
- Analytics, se houver, sem dados pessoais e sem dados dos arquivos.

## Variáveis de ambiente e segredos

- **Nunca** crie, edite ou leia o `.env` do usuário. **Ele preenche as chaves manualmente** a partir do `.env.example`.
- Ao precisar de uma nova variável: adicione-a ao `.env.example` (sem valor real) e avise o usuário.
- Nunca commite `.env*` (exceto o `.env.example`).
- Variáveis previstas:
  - `NEXT_PUBLIC_SITE_URL`: URL pública do site. **Obrigatória no build de produção** (o build falha sem ela); para rodar `pnpm build` localmente, o usuário a preenche no `.env.local`. O CI usa `http://localhost:3000`.
  - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: ID do publisher (`ca-pub-...`). Sem ela, os anúncios não aparecem.
- As `NEXT_PUBLIC_*` entram na página durante o build: depois de mudar, é preciso publicar de novo.

## Planos (`plans/`)

```
plans/
  index.md        # painel com todas as fases, status, branch e PR
  TEMPLATE.md     # modelo obrigatório para cada plano
  phases/         # um arquivo .md por fase
```

### Nomenclatura das fases

Formato: **`NN-verbo-entrega.md`**, por exemplo `03-converter-png-jpg-para-webp.md`.

- `NN` com 2 dígitos (`01`, `02`… `10`).
- Começa por um **verbo de ação** e cita a **entrega concreta** (e a tecnologia principal, quando fizer sentido).
- kebab-case, **sem acentos**, até cerca de 50 caracteres.
- Proibido usar termos vagos: "base", "ajustes", "melhorias", "geral".
- **O número só nasce com o plano:** ao criar o plano, a fase recebe o número seguinte ao do último plano criado (o próximo da sequência em `phases/`), seja qual for a fase escolhida. **Nunca renumere** fases que já têm plano.
- As fases previstas (⬜, sem plano) ficam no `index.md` **sem número e sem branch**, numa lista em ordem de prioridade. Podem ser divididas, juntadas ou reordenadas à vontade.
- Para citar uma fase sem plano (em outro plano, no código ou na documentação), use o nome dela, nunca um número.

### Ciclo de vida de um plano

1. Só crie um plano quando o usuário pedir. Use o `TEMPLATE.md` e marque a fase como 📝 Rascunho no `index.md`.
2. **O plano fica só local (sem commit e sem push) até o usuário revisá-lo.** Ajustes pedidos na revisão também ficam locais.
3. **Depois da revisão do usuário**, commite e envie (push) o plano na `main` (arquivo da fase + `index.md`), sempre antes de qualquer implementação. Commit: `docs(plans): adiciona plano da fase NN`. É a única exceção à regra de não commitar em `main`.
4. **Só implemente quando o usuário mandar explicitamente** (ex.: "pode implementar a fase NN"). Criar, revisar ou aprovar um plano **não** autoriza a implementação. Depois de commitar o plano, pare e aguarde a ordem.
5. Ao começar, crie a branch a partir da `main` atualizada e marque 🚧. Ao abrir o PR, marque 🔍 e preencha o número do PR.
6. Preencha a seção "Notas da implementação" antes de abrir o PR.
7. A fase só vira ✅ depois que o usuário fizer o merge.
8. Mantenha o `index.md` sempre em sincronia com o status de cada plano.

## Fluxo de trabalho (Git)

1. **Cada plano aprovado = uma branch nova** criada a partir de `main`.
   - **Mesmo nome do arquivo da fase**, com o prefixo do tipo: `feat/03-converter-png-jpg-para-webp`
   - Prefixos: `feat/`, `fix/`, `chore/`, `docs/`
2. **Commits pequenos e atômicos**, no contexto do plano:
   - **Nunca** faça um commit com muitos arquivos não relacionados. Agrupe por mudança lógica.
   - Use `git add <arquivos específicos>`, nunca `git add .` ou `git add -A`.
3. **Mensagens de commit em português**, bem documentadas, no formato Conventional Commits:
   ```
   feat(conversor): adiciona conversão de PNG e JPG para WebP

   - Cria rota /converter-webp com texto explicativo e FAQ
   - Converte no navegador com OffscreenCanvas em um Web Worker
   - Mostra o tamanho antes e depois e baixa o arquivo convertido
   ```
   Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`.
4. Ao final da implementação, **abra um PR para `main`** com `gh pr create`. O body deve conter:
   - **Resumo:** o que foi feito e por quê
   - **Mudanças:** lista das alterações principais
   - **Como testar:** passos para validar
   - **Checklist:** lint, typecheck e testes passando
   - **Observações:** pendências, decisões ou variáveis de ambiente novas
5. **O usuário faz o merge.** Nunca faça merge nem force push. Push em `main` só para commits de planos (ver "Ciclo de vida de um plano").

## Testes

- **Vitest + Testing Library:** funções puras de `src/lib/image/` (proporções, dimensões, nome do arquivo de saída, formatação de KB, detecção de tipo pelos bytes), registro de ferramentas, SEO e componentes.
- **Canvas não funciona no jsdom:** o processamento real de imagem é testado no **Playwright**, em navegador de verdade, com as imagens de `tests/fixtures/` (geradas por `pnpm fixtures:generate`, ver o README da pasta). Nos testes de unidade, simule `createImageBitmap`/`OffscreenCanvas`.
- **Nos E2E:** caminho das fixtures com `join(__dirname, "..", "fixtures", nome)` (o Playwright compila como CommonJS, sem `import.meta`); arquivo escolhido pelo `getByTestId("image-input")`; alertas buscados dentro do `<main>` (o Next tem um anunciador de rota com `role="alert"`); arrastar e soltar só depois da hidratação (`waitForLoadState("networkidle")`).
- **Playwright** (desktop + mobile): fluxos críticos de cada ferramenta (escolher arquivo → processar → baixar → conferir formato, dimensões e tamanho do arquivo baixado). Um teste confere que **nenhuma requisição de rede leva o arquivo** durante o processamento.
- Os testes leem o `<head>` de cada ferramenta (title, description, canonical, JSON-LD).
- Toda funcionalidade nova deve vir com testes que façam sentido para ela.

## O que pedir confirmação antes de fazer

- Instalar ou remover dependências fora do que foi planejado.
- Qualquer coisa que envie dados do usuário para fora do navegador.
- Qualquer coisa que toque produção (deploy, domínio, painel da Vercel ou do AdSense).
- Adicionar serviços externos além dos listados na stack.
- Mudar o slug de uma ferramenta já publicada (quebra o SEO; exige redirect 301).

## Pontos em aberto

- [x] **Nome do projeto:** Tools Fácil (só em `src/lib/site-config.ts` no código).
- [ ] **Domínio:** sugerido `toolsfacil.com.br`, ainda não registrado. Entra no plano da publicação.
- [ ] **Hospedagem:** o plano gratuito (Hobby) da Vercel **não permite uso comercial**, e um site com AdSense é comercial. Decidir entre o Vercel Pro ou uma alternativa com plano gratuito comercial (ex.: Netlify ou Cloudflare Pages, como no Babeloop).
- [ ] **Identidade visual:** paleta, fontes, logo e ícone. Até lá, tokens neutros em `globals.css` (paleta provisória e Inter, ver "Tokens e componentes base").
- [ ] **Decodificador de HEIC:** escolher a biblioteca (peso x compatibilidade) no plano do conversor.
- [ ] **Compactação de PNG:** o canvas não compacta PNG sem perdas de forma eficiente. Avaliar uma biblioteca WASM leve ou oferecer a conversão para WebP.
- [ ] **CMP de cookies:** escolher a solução de consentimento antes de ativar o AdSense.
