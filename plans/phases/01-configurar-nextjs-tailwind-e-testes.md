# 01 — Configurar Next.js, Tailwind e testes

**Status:** 👍 Aprovado · **Branch:** `feat/01-configurar-nextjs-tailwind-e-testes` · **Depende de:** —

## Objetivo

Criar o esqueleto do projeto: Next.js com TypeScript e Tailwind, ferramentas de qualidade (ESLint, Prettier, typecheck) e as duas camadas de teste (Vitest para unitários e componentes, Playwright para E2E), cada uma já funcionando com um teste de fumaça. Ao final, qualquer fase seguinte começa a escrever código e testes sem configurar nada.

## Escopo

- **Inclui:**
  - Repositório git e repositório no GitHub (ver "Pontos a confirmar")
  - Next.js 16 (App Router, `src/`, Turbopack) com TypeScript `strict`
  - Tailwind CSS v4
  - ESLint (config do Next) + Prettier com `prettier-plugin-tailwindcss`
  - Script `typecheck`
  - Vitest + Testing Library + jsdom
  - Playwright (Chromium) com projetos desktop e mobile, subindo o servidor do Next sozinho
  - Pastas iniciais da estrutura do `CLAUDE.md`
  - `src/lib/site-config.ts` com o nome provisório ("Tools") e a descrição do site
  - `.env.example` com `NEXT_PUBLIC_SITE_URL` (sem valor)
  - Versão do Node fixada (`.nvmrc` + `engines`)
  - Husky + lint-staged: Prettier e ESLint nos arquivos alterados a cada commit
  - CI no GitHub Actions: lint, format, typecheck, testes unitários, E2E e build em todo PR para `main`
- **Não inclui:**
  - Identidade visual, tokens e componentes base (fase 02)
  - Header, footer e home real (fase 03)
  - SEO, sitemap e `robots` (fase 04)
  - Qualquer ferramenta ou processamento de imagem (fases 05 em diante)
  - Deploy (fase 12)

## Decisões técnicas

| Decisão                                             | Motivo                                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16.4** + **React 19**                     | Mesma base estável do Babeloop, já validada nesta máquina                                                                                                      |
| **Tailwind v4**                                     | Configuração via CSS (`@theme`), sem `tailwind.config.js`. Os tokens entram na fase 02                                                                         |
| **Pasta `src/`**                                    | Separa o código da aplicação dos arquivos de configuração da raiz                                                                                              |
| **ESLint via CLI** (`eslint .`)                     | O Next 16 removeu o `next lint`                                                                                                                                |
| **`typecheck` = `next typegen && tsc --noEmit`**    | Tipos globais (`LayoutProps`, `PageProps`) são gerados pelo Next e não existem num clone limpo (aprendizado do Babeloop)                                       |
| **Vitest** em vez de Jest                           | Mais rápido, TypeScript e ESM nativos, menos configuração                                                                                                      |
| **Playwright só com Chromium**, desktop + mobile    | Suficiente para o MVP, e a maior parte do público vem do celular. WebKit pode entrar na fase 11, para conferir o Safari (HEIC e limites de canvas do iOS)      |
| **Processamento de imagem testado no Playwright**   | Canvas e `createImageBitmap` não existem no jsdom. O Vitest fica com funções puras e componentes                                                               |
| **Sem banco, sem Docker, sem Prisma**               | O projeto não guarda dados: tudo roda no navegador                                                                                                             |
| **Scaffold em pasta temporária**                    | O `create-next-app` não aceita diretório com arquivos (`CLAUDE.md`, `plans/`). O projeto é gerado no scratchpad e movido para cá, mesclando o `.gitignore`     |
| **Node 22 LTS (mínimo 22.22)**                      | Versão instalada (22.23.4). O jsdom e o lint-staged atuais exigem ≥ 22.22                                                                                      |
| **Manter `output` padrão** (sem `output: "export"`) | A exportação estática facilitaria a hospedagem, mas tira os cabeçalhos do `next.config.ts` (CSP) e as rotas de API (Pix no futuro). A decisão volta na fase 12 |

Comando base do scaffold (flags conferidas com `--help` na hora):

```bash
pnpm create next-app@16.4.5 <tmp> --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --turbopack --no-react-compiler
```

## Tarefas

- [ ] Inicializar git, fazer o commit inicial em `main` (`CLAUDE.md` + `plans/`) e criar o repositório no GitHub
- [ ] Criar a branch `feat/01-configurar-nextjs-tailwind-e-testes`
- [ ] Gerar o projeto Next.js no scratchpad e mover para a raiz
- [ ] Mesclar o `.gitignore` (incluir `referencias/`)
- [ ] Conferir `strict` e o alias `@/*` no `tsconfig.json`
- [ ] Configurar Prettier + plugin do Tailwind (`.prettierrc`, `.prettierignore`) e integrar ao ESLint (`eslint-config-prettier`)
- [ ] Adicionar os scripts `lint`, `format`, `format:check`, `typecheck`
- [ ] Limpar o boilerplate: página inicial simples ("Tools — em breve", com o nome vindo de `site-config.ts`), remover SVGs de exemplo
- [ ] Criar `src/lib/site-config.ts` e as pastas `src/components/ui`, `src/lib/image`, `src/workers`, `src/types`
- [ ] Instalar e configurar o Vitest (`vitest.config.mts`, `vitest.setup.ts`, jest-dom)
- [ ] Escrever o teste de componente da página inicial
- [ ] Instalar e configurar o Playwright (`playwright.config.ts` com `webServer`, projetos desktop e mobile)
- [ ] Escrever o teste E2E da página inicial
- [ ] Criar `tests/fixtures/` com um `README.md` explicando o uso (as imagens entram na fase 05)
- [ ] Adicionar `.env.example`, `.nvmrc` e `engines` no `package.json`
- [ ] Configurar Husky + lint-staged (hook `pre-commit`)
- [ ] Criar o workflow `.github/workflows/ci.yml`
- [ ] Escrever o `README.md` em português (o que é, como rodar, comandos)
- [ ] Rodar `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build`. Todos devem passar
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Scripts previstos no `package.json`

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "next typegen && tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

## Commits previstos

**Em `main` (base para o PR):**

0. `docs: adiciona CLAUDE.md, estrutura de planos e plano da fase 01`

**Na branch da fase:**

1. `chore(setup): cria projeto Next.js 16 com TypeScript e Tailwind v4`
   Só os arquivos gerados pelo scaffold, sem alteração manual. É um commit maior, por isso fica isolado.
2. `chore(setup): mescla .gitignore do Next com as regras do projeto`
3. `chore(setup): fixa versão do Node com .nvmrc e engines`
4. `chore(qualidade): configura Prettier com plugin do Tailwind`
5. `chore(qualidade): integra Prettier ao ESLint e adiciona script de typecheck`
6. `refactor(estrutura): remove boilerplate e organiza pastas de src/`
7. `feat(config): centraliza nome e descrição do site em site-config`
8. `test(unit): configura Vitest com Testing Library e jsdom`
9. `test(unit): adiciona teste da página inicial`
10. `test(e2e): configura Playwright com servidor do Next e viewport mobile`
11. `test(e2e): adiciona teste E2E da página inicial`
12. `chore(env): adiciona .env.example`
13. `chore(qualidade): adiciona Husky e lint-staged no pre-commit`
14. `ci: adiciona workflow de verificação para pull requests`
15. `docs: adiciona README em português`
16. `docs(plans): registra notas da implementação da fase 01`

## Testes

- **Vitest:** a página inicial renderiza o nome vindo de `site-config.ts`.
- **Playwright:** abrir `/` em desktop e mobile retorna 200 e exibe o nome do site.
- **Build:** `pnpm build` termina sem erros.

## Variáveis de ambiente novas

| Nome                   | Finalidade                                                            | Onde obter                               |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site. Só passa a ser usada na fase 04, opcional em dev | O domínio, quando for decidido (fase 12) |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] `pnpm dev` abre a página inicial em `http://localhost:3000`
- [ ] `pnpm lint`, `pnpm format:check` e `pnpm typecheck` passam sem erros
- [ ] `pnpm test` passa
- [ ] `pnpm test:e2e` passa (desktop e mobile)
- [ ] `pnpm build` passa
- [ ] `referencias/` e `.env*` (exceto `.env.example`) estão fora do git
- [ ] O nome "Tools" aparece só em `site-config.ts` (e nos documentos)
- [ ] CI passando no PR

## Pontos a confirmar

- **Repositório no GitHub:** sugestão `lemosdiego/tools`, privado. Você cria pelo site, ou eu crio com `gh repo create`?
- **Commit inicial direto em `main`** (`CLAUDE.md` + `plans/`), como no Babeloop.
- **PR ou merge direto** nesta fase? No Babeloop a fase 01 foi mergeada direto.
- Se o Playwright pedir `sudo` para dependências do sistema, você roda o comando manualmente.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
