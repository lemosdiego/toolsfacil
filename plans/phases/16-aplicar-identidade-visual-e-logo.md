# 16 — Aplicar identidade visual e logo

**Status:** 📝 Rascunho · **Branch:** `feat/16-aplicar-identidade-visual-e-logo` · **Depende de:** 14

## Objetivo

Trocar a aparência provisória (tokens neutros, Inter e o nome em texto no header) pela **identidade do Tools Fácil**: paleta, tipografia, logo, ícone do site e imagem de compartilhamento.

Como todo o site usa os tokens semânticos de `globals.css` e os componentes de `src/components/ui/`, a troca acontece **num lugar só**, sem tocar as páginas. A fase confere que o contraste continua AA nos dois temas.

## Referência visual

A fonte é a pasta `referencias/identidade-visual/` (logo, paleta, fontes e moodboard), que **hoje está vazia**. A fase começa pelos seus arquivos ou, se preferir, por propostas minhas (ver "Pontos para a revisão").

## Escopo

- **Inclui:**
  - **Paleta:** novos valores para os tokens existentes (`background`, `surface`, `primary`, estados...) no tema claro e no escuro. Os nomes dos tokens não mudam
  - **Tipografia:** manter a Inter ou trocar por outra fonte, sempre auto-hospedada pelo `next/font` (sem requisição ao Google na visita)
  - **Logo:** componente `Logo` (`src/components/layout/`) em SVG inline, com o nome acessível do `site-config.ts`, no header (no lugar do texto) e no footer. Versões para o tema claro e o escuro via `currentColor`/tokens
  - **Ícones do site:** `src/app/icon.svg`, `src/app/apple-icon.png` (180 × 180) e `favicon.ico` novo, pelos arquivos de convenção do Next
  - **Manifesto** `src/app/manifest.ts`: nome, cores e ícones (para "adicionar à tela inicial"), sem service worker
  - **`theme-color`** no layout (barra do navegador no celular), nos dois temas
  - **Imagem de compartilhamento** (`opengraph-image.tsx`) com a arte final: logo, frase e cores novas
  - **Raios e sombras**, se a identidade pedir: só os valores no `@theme` (e os nomes novos, se houver, também no `cn.ts`)
  - **`/styleguide`** atualizado com o logo e a paleta
  - Atualizar o `CLAUDE.md` (identidade definida, ponto em aberto resolvido)
- **Não inclui:**
  - Mudanças de layout ou de textos das páginas
  - Botão de trocar o tema (continua seguindo o `prefers-color-scheme`)
  - Ilustrações ou fotos novas nas páginas
  - PWA com funcionamento offline

## Decisões técnicas

| Decisão                                                | Motivo                                                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trocar valores, não nomes de tokens**                | As páginas e os componentes continuam iguais. O risco fica concentrado em `globals.css` e o axe aponta qualquer contraste quebrado                       |
| **Logo em SVG inline**                                 | Sem requisição extra, nítido em qualquer tela e com a cor vinda dos tokens (funciona no tema escuro). Um `<img>` não herdaria a cor                      |
| **Fonte pelo `next/font`**                             | Auto-hospedada no build: nenhum dado da visita vai ao Google, e a fonte não causa CLS (`size-adjust` automático)                                         |
| **Contraste conferido por fórmula e pelo axe**         | Cada par texto/fundo e controle/fundo tem a razão calculada (AA: 4,5:1 para texto, 3:1 para bordas de controle e foco). O axe confirma nas páginas reais |
| **Cores do `opengraph-image.tsx` copiadas dos tokens** | O `ImageResponse` não lê variáveis CSS. É a única exceção à regra dos hex soltos, já documentada                                                         |
| **Manifesto sem service worker**                       | Dá nome e ícone na tela inicial sem o custo e os riscos de cache de um PWA completo                                                                      |

## Tarefas

- [ ] Receber os arquivos da identidade em `referencias/identidade-visual/` (ou aprovar uma das propostas)
- [ ] Calcular o contraste da paleta nos dois temas e ajustar o que não passar
- [ ] Aplicar a paleta, a fonte, raios e sombras em `globals.css`
- [ ] Criar o componente `Logo` e trocar o texto do header e do footer
- [ ] Gerar os ícones e o manifesto; adicionar o `theme-color`
- [ ] Refazer a imagem de compartilhamento
- [ ] Atualizar o `/styleguide`
- [ ] Rodar o axe em todas as páginas, nos dois temas, e conferir à vista em 360 px e no desktop
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `style(tema): aplica a paleta do Tools Fácil nos dois temas`
2. `style(tema): aplica a tipografia da identidade` (se a fonte mudar)
3. `feat(layout): adiciona o logo no header e no footer`
4. `feat(seo): adiciona ícones, manifesto e cor do tema`
5. `feat(seo): refaz a imagem de compartilhamento com a identidade`
6. `docs(styleguide): mostra o logo e a paleta nova`
7. `docs: registra a identidade visual no CLAUDE.md`
8. `docs(plans): registra notas da implementação da fase 16`

## Testes

- **Vitest:** `Logo` com nome acessível e sem texto duplicado para o leitor de tela; manifesto com nome, cores e ícones; contraste da paleta calculado num teste (pares texto/fundo dos dois temas, a partir dos valores de `globals.css`)
- **Playwright:** axe nos dois temas em todas as páginas (já existente, roda de novo com as cores novas); ícones (`/icon.svg`, `/apple-icon.png`, `/manifest.webmanifest`) respondendo 200; `og:image` presente; header com o logo em 360 px sem quebrar
- **Visual:** capturas de tela da home, de uma ferramenta e do menu, nos dois temas, anexadas ao PR para você conferir

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [ ] Paleta, fonte e logo aplicados no site inteiro, sem mudar as páginas
- [ ] Contraste AA nos dois temas (axe sem violações em todas as páginas)
- [ ] Ícone do site, ícone da tela inicial, manifesto e `theme-color`
- [ ] Imagem de compartilhamento com a arte final
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **De onde vem a identidade:** você já tem logo e paleta (ou vai contratar um designer)? Se não, posso propor 2 ou 3 direções (paleta + logo tipográfico em SVG) para você escolher antes da implementação.
- **Fonte:** manter a Inter (neutra, ótima legibilidade e já carregada) ou trocar? Uma segunda fonte só para títulos adiciona cerca de 20 a 30 KB.
- **Manifesto (adicionar à tela inicial):** incluir agora ou deixar para depois do lançamento?

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
