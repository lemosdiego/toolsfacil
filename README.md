# Tools Fácil

Hub de micro-ferramentas para imagens: converter, cortar e compactar em segundos, direto no navegador.

- **Rápido:** entra, resolve e baixa. Sem cadastro.
- **Privado:** os arquivos **nunca saem do seu dispositivo**. Todo o processamento acontece no navegador.
- **Custo zero de infraestrutura:** site estático/serverless, sem servidor processando arquivos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (`strict`) · Tailwind CSS v4 · Vitest + Testing Library · Playwright · ESLint + Prettier · pnpm

## Requisitos

- Node.js 22 LTS (mínimo 22.22, veja o `.nvmrc`)
- pnpm 10 ou superior (nunca use npm ou yarn)

## Como rodar

```bash
pnpm install                            # instala as dependências e os hooks do Git
pnpm exec playwright install chromium   # baixa o navegador dos testes E2E (só na primeira vez)
pnpm dev                                # http://localhost:3000
```

As variáveis de ambiente estão documentadas no `.env.example`. Copie para `.env.local` e preencha quando precisar.

## Comandos

| Comando             | O que faz                                                      |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Servidor de desenvolvimento                                    |
| `pnpm build`        | Build de produção                                              |
| `pnpm start`        | Roda o build de produção                                       |
| `pnpm lint`         | ESLint                                                         |
| `pnpm format`       | Formata o código com o Prettier                                |
| `pnpm format:check` | Só verifica a formatação (usado no CI)                         |
| `pnpm typecheck`    | Gera os tipos do Next e roda o `tsc --noEmit`                  |
| `pnpm test`         | Testes unitários e de componentes (Vitest)                     |
| `pnpm test:watch`   | Vitest em modo watch                                           |
| `pnpm test:e2e`     | Testes E2E (Playwright, desktop e mobile; sobe o Next sozinho) |

Antes de abrir um PR, todos devem passar: `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build`. O CI roda os mesmos comandos em todo PR para `main`, e o hook de `pre-commit` aplica ESLint e Prettier nos arquivos alterados.

## Estrutura

```
src/
  app/            # rotas (App Router)
  components/     # componentes React
  lib/            # funções puras e configuração (site-config.ts)
  workers/        # Web Workers de processamento de imagem
  types/
tests/
  e2e/            # Playwright
  fixtures/       # imagens de teste
plans/            # planos de cada fase do projeto
```

O roteiro e o status de cada fase estão em [`plans/index.md`](plans/index.md).
