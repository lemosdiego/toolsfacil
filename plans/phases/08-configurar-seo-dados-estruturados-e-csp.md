# 08 — Configurar SEO, dados estruturados e CSP

**Status:** 🚧 Em andamento · **Branch:** `feat/08-configurar-seo-dados-estruturados-e-csp` · **Depende de:** 07

## Objetivo

Preparar a base para que **toda tela nova já nasça pronta para o Google e protegida**: metadados (`title`, `description`, `canonical`, Open Graph), dados estruturados (JSON-LD), `sitemap.xml`, `robots.txt` e os cabeçalhos de segurança com a CSP.

Depois desta fase, uma página de ferramenta só chama uma função do `seo.ts` e coloca o `JsonLd`. Ela não monta metadados à mão, e nenhuma URL sai com `localhost` para os robôs.

## Escopo

- **Inclui:**
  - **`src/lib/seo.ts`:**
    - `getSiteUrl()` e `absoluteUrl(path)`, a partir de `NEXT_PUBLIC_SITE_URL`
    - `baseOpenGraph`: o objeto base do Open Graph (nome do site, `pt_BR`, `website`), do qual toda página parte
    - `createPageMetadata({ title, description, path })`: `title`, `description`, `alternates.canonical` e `openGraph` (base + dados da página)
    - `createToolMetadata(tool, { title, description })`: o mesmo, para as páginas de ferramenta, com o `path` vindo do registro
  - **Metadados do layout raiz:** `metadataBase`, `title` com modelo (`%s | Tools Fácil`) e título padrão, `description` e o Open Graph base
  - **Imagem do Open Graph** (`src/app/opengraph-image.tsx`, `ImageResponse` do `next/og`): nome do site e frase curta, com as cores neutras provisórias. A imagem definitiva vem com a identidade visual
  - **`JsonLd`** (`src/components/seo/json-ld.tsx`): o único lugar com `dangerouslySetInnerHTML`, escapando o `<` (`<`)
  - **Montadores de JSON-LD** em `src/lib/structured-data.ts`, com tipos próprios mínimos: `webApplicationJsonLd(tool)`, `faqPageJsonLd(perguntas)` e `webSiteJsonLd()`
  - **`src/app/sitemap.ts`:** a home, as páginas fixas (`sitePages`, por enquanto só `/`) e as ferramentas `available` do registro
  - **`src/app/robots.ts`:** libera tudo, menos `/api/`, e aponta para o sitemap
  - **Cabeçalhos de segurança** no `next.config.ts`, montados por uma função pura e testada (`src/lib/security-headers.ts`): CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e HSTS (só em produção)
  - **Home atual** com `createPageMetadata` (`canonical` `/`). O JSON-LD `WebSite` da home entra na fase 06, com o conteúdo dela
  - **CI:** `NEXT_PUBLIC_SITE_URL=http://localhost:3000` no `ci.yml`, para o build de produção do CI passar
  - Atualizar o `.env.example` (comentários ainda citam números antigos de fase) e o `CLAUDE.md` (funções do `seo.ts`, cabeçalhos e quando entram os domínios do AdSense)
- **Não inclui:**
  - Os domínios do AdSense na CSP (entram na fase do AdSense, junto com o script real, quando dá para testar a política com anúncios de verdade)
  - Ícones, `manifest` e favicon definitivos (identidade visual)
  - Metadados e JSON-LD das páginas de ferramenta e das institucionais (cada uma na sua fase, usando o que esta fase cria)
  - Analytics

## Decisões técnicas

| Decisão                                                                                                                                                                                                                                                                     | Motivo                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSP no `next.config.ts`, sem nonce** (`script-src 'self' 'unsafe-inline'`)                                                                                                                                                                                                | Pela documentação local do Next 16, CSP com nonce obriga **toda página a ser renderizada no servidor a cada visita**: sem página estática, sem cache de CDN e com custo de servidor. Isso quebra o "custo zero" e piora o Core Web Vitals. O `'unsafe-inline'` é necessário para os scripts que o próprio Next coloca na página |
| **Sem SRI experimental do Next**                                                                                                                                                                                                                                            | A alternativa com hash (SRI) é experimental e pode mudar. Reavaliar quando for estável                                                                                                                                                                                                                                          |
| **Política restrita no resto**: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `img-src 'self' blob: data:`, `worker-src 'self' blob:`, `connect-src 'self'`, `font-src 'self'`, `upgrade-insecure-requests` | Bloqueia o que a CSP sem nonce ainda consegue bloquear: plugins, `<base>` trocado, o site dentro de `iframe` de terceiros e envio de dados para domínios de fora. `blob:` e `data:` cobrem as prévias locais e o Web Worker                                                                                                     |
| **CSP também em dev**, com `'unsafe-eval'` e `ws:` só lá                                                                                                                                                                                                                    | Violação da política aparece já no `pnpm dev` e nos testes, e não só depois de publicar. O React usa `eval` em dev, e o recarregamento automático usa WebSocket                                                                                                                                                                 |
| **Domínios do AdSense só na fase do AdSense**                                                                                                                                                                                                                               | Sem o script real, não dá para testar a lista. Liberar antes deixaria a política mais aberta sem necessidade                                                                                                                                                                                                                    |
| **`NEXT_PUBLIC_SITE_URL` obrigatória no build de produção**: sem ela, o build falha com uma mensagem em português                                                                                                                                                           | Uma URL `localhost` no sitemap, no `canonical` e no Open Graph prejudica o SEO sem ninguém perceber. Melhor o build falhar. Em dev, o padrão é `http://localhost:3000`. O CI define a variável no `ci.yml`                                                                                                                      |
| **Título com modelo** `%s \| Tools Fácil` no layout                                                                                                                                                                                                                         | Cada página passa só o próprio título. O nome do site continua vindo só do `site-config.ts`                                                                                                                                                                                                                                     |
| **`createPageMetadata` e `createToolMetadata` partem do `baseOpenGraph`**                                                                                                                                                                                                   | O `openGraph` da página substitui o do layout inteiro, sem mesclar (regra do `CLAUDE.md`). Partir da base evita perder `siteName` e `locale`                                                                                                                                                                                    |
| **Imagem do Open Graph gerada no build** com `next/og`                                                                                                                                                                                                                      | Já vem com o Next (sem dependência). Fica estática, e a troca pela arte final é num arquivo só                                                                                                                                                                                                                                  |
| **Tipos próprios e mínimos para o JSON-LD**, sem `schema-dts`                                                                                                                                                                                                               | São três tipos (`WebApplication`, `FAQPage`, `WebSite`). Uma dependência só para tipos não compensa. Nunca entram avaliações, notas ou número de usuários                                                                                                                                                                       |
| **Sitemap sem `lastModified`**                                                                                                                                                                                                                                              | Não existe uma data confiável de alteração por página, e o Google ignora datas imprecisas                                                                                                                                                                                                                                       |
| **`Permissions-Policy`** desliga `camera`, `microphone`, `geolocation` e `payment`                                                                                                                                                                                          | O site não usa nenhuma dessas APIs. A câmera do celular continua disponível pelo seletor de arquivo do sistema, que não depende dessa permissão                                                                                                                                                                                 |
| **HSTS só em produção** (`max-age` de 2 anos, `includeSubDomains`, sem `preload`)                                                                                                                                                                                           | Em `localhost` não faz sentido. O `preload` é difícil de desfazer e fica para depois de o domínio estar estável                                                                                                                                                                                                                 |

## Tarefas

- [x] Criar o `seo.ts` com as funções de URL e de metadados, com testes
- [x] Aplicar os metadados base no layout raiz e o `createPageMetadata` na home
- [x] Criar a imagem do Open Graph
- [x] Criar o `JsonLd` e os montadores de JSON-LD, com testes
- [x] Criar o `sitemap.ts` e o `robots.ts`, com testes
- [x] Criar o `security-headers.ts` e aplicar os cabeçalhos no `next.config.ts`
- [x] Definir `NEXT_PUBLIC_SITE_URL` no `ci.yml`
- [x] Testes E2E (desktop e mobile, dev e build de produção)
- [x] Atualizar o `.env.example` e o `CLAUDE.md`
- [x] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(seo): adiciona URLs absolutas e metadados base das páginas`
2. `feat(seo): adiciona imagem do Open Graph gerada no build`
3. `feat(seo): adiciona JsonLd e os montadores de dados estruturados`
4. `feat(seo): gera sitemap e robots a partir do registro`
5. `feat(seguranca): adiciona CSP e cabeçalhos de segurança`
6. `ci: define a URL do site no build do CI`
7. `test(e2e): verifica metadados, sitemap, robots e cabeçalhos`
8. `docs: registra SEO e cabeçalhos de segurança no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 08`

Os testes de unidade entram no mesmo commit do código.

## Testes

- **Vitest:**
  - `getSiteUrl()`: usa a variável sem a barra final; `localhost` em dev; erro claro em produção sem a variável
  - `absoluteUrl()`: junta a URL do site com o caminho, com e sem barra
  - `createPageMetadata()` e `createToolMetadata()`: `canonical`, `openGraph.url` e os campos do `baseOpenGraph` preservados
  - `JsonLd`: escapa `<` (um texto com `</script>` não fecha a tag)
  - Montadores: `WebApplication` com nome, URL, categoria e `offers` gratuito; `FAQPage` com as perguntas; nada de `aggregateRating`
  - `sitemap`: home + ferramentas `available`; nenhuma `soon`; URLs absolutas
  - `robots`: `disallow` `/api/` e o endereço do sitemap
  - `security-headers`: diretivas esperadas em produção; `'unsafe-eval'` e `ws:` só em dev; HSTS só em produção
- **Playwright (desktop e mobile):**
  - Home: `title`, `description`, `canonical` e `og:image` no `<head>`
  - `/sitemap.xml` e `/robots.txt` respondem 200 com o conteúdo esperado
  - Toda resposta de página traz a CSP e os demais cabeçalhos
  - Nenhuma violação de CSP no console em todas as páginas (home, 404, tela de erro e styleguide, que usa imagem `data:`)

## Variáveis de ambiente novas

| Nome                   | Finalidade                                                                                                                      | Onde obter                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Já está no `.env.example`. Passa a ser usada: base do `canonical`, do sitemap e do Open Graph. Obrigatória no build de produção | A URL pública do site (ex.: `https://toolsfacil.com.br`), definida na publicação |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.
>
> Para rodar `pnpm build` na sua máquina, preencha `NEXT_PUBLIC_SITE_URL` no `.env.local` (ex.: `http://localhost:3000`).

## Critérios de aceite

- [x] A home sai com `title`, `description`, `canonical` e Open Graph completos, e com URLs absolutas
- [x] `sitemap.xml` lista só a home e as ferramentas prontas; `robots.txt` bloqueia `/api/`
- [x] `JsonLd` escapa o conteúdo e é o único uso de `dangerouslySetInnerHTML`
- [x] Todas as páginas respondem com a CSP e os cabeçalhos de segurança, sem violações no console
- [x] Build de produção sem `NEXT_PUBLIC_SITE_URL` falha com uma mensagem clara
- [x] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **`'unsafe-inline'` nos scripts:** é o preço de manter as páginas estáticas e o custo zero. A alternativa (nonce) obriga renderização no servidor a cada visita.
- **Build falhando sem `NEXT_PUBLIC_SITE_URL`:** o `pnpm build` local passa a exigir a variável no `.env.local`.

## Notas da implementação

**Desvios do plano**

- **`tagline` no `site-config.ts`** ("Ferramentas de imagem online e grátis"): usada no título da home e na imagem do Open Graph. O título da home virou "Tools Fácil: Ferramentas de imagem online e grátis", e o E2E antigo da home passou a conferir só que o nome está no título.
- **`site-pages.ts`** com as páginas fixas do sitemap (por enquanto só `/`). A fase das institucionais acrescenta as dela ali.
- **Canonical da home sem a barra final** (`https://site.com.br`): o Next normaliza a URL da raiz. É equivalente para o Google.
- **Regra `react/no-danger` no ESLint**, liberada só no `json-ld.tsx`: garante a regra do `CLAUDE.md` sem depender de revisão.
- **Cabeçalhos a mais:** `X-Frame-Options: DENY` (reforço do `frame-ancestors` para navegadores antigos), `manifest-src 'self'` e `blob:` no `connect-src` (leitura local de URLs `blob:` pelas ferramentas).
- **`upgrade-insecure-requests` só em produção:** em dev o site roda em `http://localhost`. No build de produção rodando em `localhost`, os testes passaram com a diretiva ligada.
- **Imagem do Open Graph sem negrito:** a fonte padrão do `next/og` não tem o peso 700. Serve até a identidade visual, que traz a fonte e a arte finais.

**Como rodar o build de produção localmente:** `NEXT_PUBLIC_SITE_URL=http://localhost:3100 pnpm build` e `NEXT_PUBLIC_SITE_URL=http://localhost:3100 CI=1 PORT=3100 pnpm test:e2e` (a porta 3000 costuma estar com o `pnpm dev`).

**Testes:** 138 de unidade e componente; E2E com 104 testes em dev e 62 no build de produção (desktop e mobile), sem nenhuma violação de CSP. O build sem `NEXT_PUBLIC_SITE_URL` falha com a mensagem em português. Todas as rotas continuam estáticas.

**Pendências**

- Os domínios do AdSense entram na CSP na fase do AdSense.
- Ícones, `manifest` e a arte final do Open Graph ficam para a identidade visual.
