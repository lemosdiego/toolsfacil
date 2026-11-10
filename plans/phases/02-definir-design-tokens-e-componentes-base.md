# 02 — Definir design tokens e componentes base

**Status:** 👍 Aprovado · **Branch:** `feat/02-definir-design-tokens-e-componentes-base` · **Depende de:** 01

## Objetivo

Criar a fundação visual do site: tokens semânticos de cor, tipografia, formas e sombras no Tailwind v4, a fonte da interface e os componentes genéricos que todas as páginas e ferramentas vão reaproveitar. A identidade definitiva ainda não existe, então os tokens começam **neutros**: quando a marca chegar, só os valores em `globals.css` mudam, e os componentes ficam iguais.

## Escopo

- **Inclui:**
  - Tokens semânticos em `src/app/globals.css` (`@theme`): cores, raios, sombras, espaçamento do container
  - Fonte da interface via `next/font`, sem requisição a servidor externo
  - Utilitário `cn()` (`src/lib/cn.ts`) com `clsx` + `tailwind-merge`
  - Componentes em `src/components/ui/`: `Button`, `IconButton`, `Card`, `Container`, `Heading`, `Badge`, `Alert`, `Spinner`, `ProgressBar`, `VisuallyHidden`
  - Ícones com `lucide-react`, importados um a um
  - Página `/styleguide`, disponível só em desenvolvimento, com todos os tokens e componentes
  - Regras de acessibilidade nos componentes (foco visível, 44px de toque, `aria-label` obrigatório no `IconButton`)
- **Não inclui:**
  - Logo, ícone do site e paleta da marca (aguardam a identidade visual)
  - Header, footer e home (fase 03)
  - Componentes de ferramenta, como a área de soltar arquivo e o botão de download (fase 05)
  - Espaço de anúncio (`AdSlot`), que entra no layout da fase 03

## Decisões técnicas

| Decisão                                               | Motivo                                                                                                                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tokens semânticos, nunca cores do Tailwind**        | `bg-surface`, `text-muted`, `border-line`, `bg-primary`/`text-on-primary`, `text-danger`, `text-success`. Trocar a marca vira editar um arquivo                                  |
| **Paleta neutra provisória**                          | Cinzas + uma cor de destaque (azul acessível). Contraste AA conferido para cada par de texto e fundo                                                                             |
| **Fonte Inter** via `next/font/google` (subset latin) | Leve, legível em telas pequenas e com números tabulares (bons para KB e dimensões). Auto-hospedada no build: sem chamada ao Google em tempo real (melhor para CSP e privacidade) |
| **Tema claro e escuro por `prefers-color-scheme`**    | Ver "Pontos a confirmar". Os tokens recebem os dois valores, sem botão de troca no MVP                                                                                           |
| **`lucide-react`**                                    | Ícones SVG com _tree-shaking_: só os importados entram no bundle                                                                                                                 |
| **Variantes com um mapa de classes simples**          | Sem `class-variance-authority` por ora: poucos componentes, menos dependências. Pode entrar se as variantes crescerem                                                            |
| **`/styleguide` só em dev**                           | `notFound()` quando `NODE_ENV === "production"`, para não ser indexada nem ocupar o build                                                                                        |
| **Server Components por padrão**                      | Só os componentes com estado viram `"use client"`. `Button` vira link quando recebe `href`, sem duplicar estilos                                                                 |

## Tarefas

- [ ] Instalar `clsx`, `tailwind-merge` e `lucide-react` (confirmar o peso antes)
- [ ] Criar `src/lib/cn.ts` com teste
- [ ] Definir os tokens em `globals.css` (cores claras e escuras, raios, sombras)
- [ ] Configurar a fonte Inter no `layout.tsx` (`font-sans`)
- [ ] Criar `Container` e `Heading` (níveis h1 a h3, com tamanho independente da tag)
- [ ] Criar `Button` (variantes `primary`, `secondary`, `ghost`; tamanhos `md` e `lg`; estado `loading`; link com `href`)
- [ ] Criar `IconButton` (`aria-label` obrigatório pelo tipo)
- [ ] Criar `Card`, `Badge` e `Alert` (`info`, `success`, `error`, com `role` adequado)
- [ ] Criar `Spinner`, `ProgressBar` (com `aria-valuenow`) e `VisuallyHidden`
- [ ] Criar a página `/styleguide` (só em dev) com tokens, tipografia e todos os componentes
- [ ] Testes de componente de cada um
- [ ] Teste E2E: `/styleguide` abre em dev; checagem de contraste com `@axe-core/playwright` (ver "Pontos a confirmar")
- [ ] Atualizar a seção de identidade visual do `CLAUDE.md` com os tokens e componentes criados
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `chore(deps): adiciona clsx, tailwind-merge e lucide-react`
2. `feat(ui): adiciona utilitário cn para combinar classes`
3. `feat(tema): define tokens semânticos de cor, raio e sombra`
4. `feat(tema): configura fonte Inter com next/font`
5. `feat(ui): adiciona Container e Heading`
6. `feat(ui): adiciona Button e IconButton`
7. `feat(ui): adiciona Card, Badge e Alert`
8. `feat(ui): adiciona Spinner, ProgressBar e VisuallyHidden`
9. `feat(styleguide): cria página de referência visual só em desenvolvimento`
10. `test(e2e): verifica styleguide e contraste com axe`
11. `docs: registra tokens e componentes base no CLAUDE.md`
12. `docs(plans): registra notas da implementação da fase 02`

Os testes de cada componente entram no mesmo commit do componente.

## Testes

- **Vitest + Testing Library:** `cn()` resolve conflitos de classes; `Button` renderiza como `<button>` ou `<a>`, fica desabilitado e com `aria-busy` em `loading`; `IconButton` expõe o `aria-label`; `Alert` usa `role="alert"` no erro e `role="status"` nos demais; `ProgressBar` expõe o valor.
- **Playwright:** `/styleguide` abre em dev (desktop e mobile) e passa no axe sem violações de contraste, nos temas claro e escuro (`colorScheme`).

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [ ] Nenhum componente usa hex nem cores do Tailwind (`zinc`, `gray`...): só os tokens
- [ ] Todos os componentes aparecem no `/styleguide`, que retorna 404 no build de produção
- [ ] Botões e alvos de toque com no mínimo 44px; foco visível no teclado
- [ ] Contraste AA nos dois temas (axe sem violações)
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos a confirmar

- **Tema escuro:** recomendo **claro + escuro automático** (segue o sistema). Ferramentas de imagem são muito usadas por designers e devs, que costumam usar o modo escuro, e com tokens o custo é baixo. Se preferir só o claro, como no Babeloop, o plano fica menor.
- **Fonte:** Inter como padrão provisório. Se você já tiver uma preferência ou referências em `referencias/identidade-visual/`, eu sigo elas.
- **`@axe-core/playwright`:** dependência de desenvolvimento nova, só para os testes de acessibilidade. Ok incluir?

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
