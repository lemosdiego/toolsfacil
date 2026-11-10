# 03 — Construir layout e home das ferramentas

**Status:** 🚫 Descartado · **Branch:** `feat/03-construir-layout-e-home-das-ferramentas` · **Depende de:** 02

> **Descartada em 10/11/2026.** O usuário preferiu um layout mais enxuto, em que a pessoa chega e já usa a ferramenta, sem home cheia de seções. O PR #3 não será mergeado. A navegação passou para a [fase 04](04-construir-header-com-menu-de-ferramentas.md), e as outras telas entram por etapas, a partir dos prints do usuário. O código da branch fica como referência para reaproveitar.

## Objetivo

Dar ao site a sua "casca": header, footer, a home com os cards das ferramentas e o esqueleto das páginas de ferramenta, com os espaços de anúncio já reservados (sem script). Também cria o **registro único das ferramentas** (`src/lib/tools.ts`), que home, menu e footer leem, e depois o sitemap (fase 04).

Ao final, cada ferramenta nova (fases 06–09) só precisa entrar no registro e usar o `ToolPageLayout`: header, footer, anúncios e a estrutura do texto já estão prontos.

## Pesquisa de inspiração (resumo)

A ideia não é copiar nenhum site, e sim pegar o que funciona e fazer do nosso jeito.

| O que a pesquisa mostrou                                                                                                              | Como usamos (e onde inovamos)                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Grade "bento"** continua forte em 2026, desde que o tamanho do bloco indique importância. Blocos todos iguais perdem a hierarquia   | Grade de ferramentas com **destaque** (card maior) para as mais usadas. No celular vira uma coluna, na ordem de importância                                                                                 |
| Hubs de ferramentas costumam ser **grades enormes e iguais**, com dezenas de ícones genéricos                                         | Cada card mostra a **transformação** (`PNG → WebP`, `2,4 MB → 0,8 MB`) com chips de formato. O usuário entende o que a ferramenta faz sem ler a descrição                                                   |
| **Privacidade verificável** é o sinal de confiança mais forte: dizer "nada sai do seu navegador" e mostrar como conferir              | Faixa de confiança no topo e uma seção **"Confira você mesmo"** com o passo a passo (aba Rede do navegador). Sem promessas de "apagamos em 1 hora", que só existem quando há upload                         |
| Sem cadastro é lido como sinal de seriedade                                                                                           | "Sem cadastro, sem limite de uso" na faixa de confiança                                                                                                                                                     |
| Área de envio: arrastar **e** clicar, limites e formatos ditos logo de cara, sem esconder a ferramenta                                | O `ToolPageLayout` reserva o topo para a ferramenta (acima da dobra no celular). A área de soltar em si é da fase 05                                                                                        |
| Anúncios: **reservar a altura** (`min-height`) é o jeito mais eficaz de evitar CLS. Sticky ajuda só em telas largas, nunca no celular | `AdSlot` com altura fixa por posição. Lateral **sticky só no desktop** (≥ 1024px). Nada de anúncio fixo no celular                                                                                          |
| Paleta de comandos (⌘K) é ótima quando o site tem muitas ferramentas                                                                  | **Fora desta fase**: com 3 ferramentas, um menu simples resolve. Fica registrada como ideia para quando houver mais de ~8                                                                                   |
| Tendência de 2026: menos "soft UI" (sombras pesadas, pastel), mais interface tátil e direta, com microinterações                      | Visual limpo com os tokens da fase 02. Assinatura própria: o **xadrez de transparência** (o fundo de editores de imagem) como textura sutil do hero, e microinterações respeitando `prefers-reduced-motion` |

## Escopo

- **Inclui:**
  - **Nome do site:** trocar o nome provisório por **"Tools Fácil"** em `site-config.ts` (única fonte no código), e atualizar `README.md` e `CLAUDE.md`
  - `src/lib/tools.ts`: registro das ferramentas (slug, nome, descrição curta, ícone, categoria, formatos de entrada e saída, status `available`/`soon`, destaque) e funções de consulta, com testes
  - **Header** (`src/components/layout/site-header.tsx`): nome do site (de `site-config.ts`), menu "Ferramentas" lido do registro e link para a home
  - **Menu mobile** com a **Popover API nativa** do HTML (`popover` + `popovertarget`): abre e fecha sem JavaScript próprio, com Esc e clique fora já tratados pelo navegador
  - **Footer** (`src/components/layout/site-footer.tsx`): ferramentas do registro, frase de privacidade e ano. Os links institucionais entram na fase 10, junto com as páginas
  - **Link "Pular para o conteúdo"** (primeiro elemento focável da página)
  - **Home** (`src/app/page.tsx`), Server Component:
    1. Hero com o `h1` ("Ferramentas de imagem online, grátis e sem enviar seus arquivos"), subtítulo e a faixa de confiança
    2. **Atalhos por intenção** ("Converter", "Cortar", "Compactar"), que rolam até o card certo
    3. Grade bento das ferramentas, com o card de destaque
    4. `AdSlot` entre a grade e o texto
    5. "Como funciona" em 3 passos (Escolha a imagem → Ajuste → Baixe)
    6. "Confira você mesmo": como verificar que nada é enviado
    7. Perguntas frequentes curtas (texto original, base para o `FAQPage` da fase 04)
  - **`ToolCard`**: ícone, nome, descrição, chips de formato (`PNG → WebP`). Ferramenta `soon` aparece com o badge "Em breve" e **não é link** (para não criar links quebrados)
  - **`ToolPageLayout`** (`src/components/tools/`): esqueleto das páginas de ferramenta (cabeçalho com `h1` e subtítulo, área da ferramenta, `AdSlot` abaixo dela, texto com coluna lateral sticky no desktop)
  - **`AdSlot`** (`src/components/ads/ad-slot.tsx`): espaço reservado com `min-height` por posição (`below-tool`, `sidebar`, `in-content`) e o rótulo "Publicidade". **Sem script do AdSense** (fase 14)
  - Exemplo do `ToolPageLayout` no `/styleguide`, para testar sem ferramenta real
  - Textura de xadrez de transparência no hero (CSS puro, com os tokens, bem sutil)
- **Não inclui:**
  - Metadados de SEO por página, `sitemap.ts`, `robots.ts` e JSON-LD (fase 04)
  - Área de soltar arquivo e qualquer processamento (fase 05). Também a ideia de "soltar a imagem na home e receber a ferramenta sugerida" (ver "Ideias para depois")
  - Rotas das ferramentas (fases 06–09)
  - Páginas institucionais e os links delas no footer (fase 10)
  - Script do AdSense e consentimento de cookies (fase 14)
  - Logo e paleta da marca (fase 12)
  - Paleta de comandos ⌘K

## Decisões técnicas

| Decisão                                                 | Motivo                                                                                                                                                                                                |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Registro com `status` (`available`/`soon`)**          | A home já mostra as 4 entregas do MVP (WebP, HEIC → JPG, cortar, compactar) antes de existirem, sem links quebrados. Quando a fase da ferramenta termina, basta trocar o status                       |
| **Ícone no registro como componente do `lucide-react`** | Tipado e com tree-shaking. O registro fica em arquivo comum (sem `"use client"`), legível por Server Components                                                                                       |
| **Menu mobile com Popover API**                         | Sem estado React, sem JavaScript extra, acessível por padrão (foco, Esc, clique fora). Suporte em todos os navegadores atuais. Sem suporte, o menu fica como lista simples no footer                  |
| **Header não fixo no celular**                          | Libera altura de tela para a ferramenta. No desktop, header sticky discreto                                                                                                                           |
| **`AdSlot` sem variável não ocupa espaço em produção**  | Segue o `CLAUDE.md`: sem `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, nenhum anúncio aparece. Em dev, mostra um contorno tracejado para visualizar a posição. A altura reservada passa a valer quando houver o ID |
| **Alturas reservadas**                                  | `below-tool` e `in-content`: 280px no celular e 250px no desktop. `sidebar`: 600px, sticky, só a partir de `lg`. Valores ajustáveis na fase 14, com os tamanhos reais servidos                        |
| **Distância mínima do anúncio**                         | O `ToolPageLayout` garante espaço (margem e divisória) entre a área da ferramenta e o `AdSlot`, para nunca ficar colado ao botão de download nem à área de soltar                                     |
| **Atalhos por intenção são âncoras** (`#converter`)     | Funcionam sem JavaScript e mantêm a home 100% Server Component                                                                                                                                        |
| **FAQ com `<details>`/`<summary>`**                     | Nativo, acessível e com o texto no HTML (bom para SEO)                                                                                                                                                |
| **Textura de xadrez com `conic-gradient`**              | Sem imagem extra, leve, e segue os tokens nos dois temas. Opacidade baixa, só decorativa (`aria-hidden`)                                                                                              |
| **Sem bibliotecas novas**                               | Tudo com Tailwind, os componentes da fase 02 e APIs nativas                                                                                                                                           |

### Estrutura visual

**Home no celular (360px):**

```
┌──────────────────────────┐
│ Tools            [Menu]  │  header (não fixo)
├──────────────────────────┤
│ ░▒ xadrez sutil ▒░       │
│ Ferramentas de imagem    │  h1
│ online, grátis e sem     │
│ enviar seus arquivos     │
│ 🔒 No navegador · Sem    │  faixa de confiança
│ cadastro · Grátis        │
│ [Converter][Cortar][...] │  atalhos por intenção
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ ★ Converter p/ WebP  │ │  card de destaque
│ │ PNG JPG → WebP       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Compactar imagem     │ │
│ │ 2,4 MB → 0,8 MB      │ │
│ └──────────────────────┘ │
│ ...                      │
├──────────────────────────┤
│ [ Publicidade ]          │  AdSlot (altura reservada)
├──────────────────────────┤
│ Como funciona (3 passos) │
│ Confira você mesmo       │
│ Perguntas frequentes     │
├──────────────────────────┤
│ footer                   │
└──────────────────────────┘
```

**Página de ferramenta no desktop (`ToolPageLayout`):**

```
┌─────────────────────────────────────────────┐
│ Tools     Ferramentas ▾                     │  header sticky
├─────────────────────────────────────────────┤
│ Converter imagem para WebP  (h1)            │
│ PNG e JPG para WebP, direto no navegador    │
│ ┌─────────────────────────────────────────┐ │
│ │        ÁREA DA FERRAMENTA (fase 05+)     │ │  acima da dobra
│ └─────────────────────────────────────────┘ │
│ ─────────── espaço de segurança ─────────── │
│ [ Publicidade ]                             │  below-tool
├──────────────────────────────┬──────────────┤
│ Como usar                    │ [Publicidade]│  sidebar sticky
│ Perguntas frequentes         │              │  (só ≥ lg)
│ Privacidade                  │              │
└──────────────────────────────┴──────────────┘
```

## Tarefas

- [ ] Aplicar o nome "Tools Fácil" em `site-config.ts`, `README.md` e `CLAUDE.md` (e ajustar os testes que leem o nome)
- [ ] Criar `src/lib/tools.ts` (tipos, registro das 4 ferramentas do MVP com status `soon`, `getAvailableTools`, `getToolBySlug`, `getToolsByCategory`) e os testes
- [ ] Criar `SkipLink`, `SiteHeader` (com o menu Popover) e `SiteFooter` em `src/components/layout/`
- [ ] Aplicar header, footer e o link de pular no `layout.tsx` (com `<main id="conteudo">`)
- [ ] Criar `AdSlot` em `src/components/ads/` (posições, alturas, rótulo, comportamento sem variável)
- [ ] Criar `ToolCard` e `ToolGrid` (bento, com destaque) em `src/components/tools/`
- [ ] Criar `ToolPageLayout` em `src/components/tools/`
- [ ] Reescrever a home com as seções previstas e o texto original em pt-BR
- [ ] Adicionar a textura de xadrez ao hero (utilitário em `globals.css`, com os tokens)
- [ ] Adicionar `AdSlot`, `ToolCard` e `ToolPageLayout` ao `/styleguide`
- [ ] Testes de unidade e de componente
- [ ] Testes E2E da home e do layout (desktop e mobile)
- [ ] Atualizar o `CLAUDE.md` (registro com status, layout, `AdSlot`)
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(config): adota o nome Tools Fácil`
2. `feat(ferramentas): cria registro único das ferramentas em tools.ts`
3. `feat(layout): adiciona header com menu de ferramentas e link de pular`
4. `feat(layout): adiciona footer com ferramentas do registro`
5. `feat(layout): aplica header e footer no layout raiz`
6. `feat(anuncios): adiciona AdSlot com altura reservada e sem script`
7. `feat(ferramentas): adiciona ToolCard e grade bento de ferramentas`
8. `feat(ferramentas): adiciona ToolPageLayout com posições de anúncio`
9. `feat(home): cria home com hero, ferramentas, passos e FAQ`
10. `feat(styleguide): adiciona exemplos de layout, cards e AdSlot`
11. `test(e2e): verifica home, navegação e layout no desktop e no mobile`
12. `docs: registra layout, registro de ferramentas e AdSlot no CLAUDE.md`
13. `docs(plans): registra notas da implementação da fase 03`

Os testes de unidade e de componente entram no mesmo commit do código.

## Testes

- **Vitest (registro):** slugs únicos, em kebab-case e sem acentos; todo item tem nome, descrição, ícone, categoria e formatos; `getAvailableTools` só devolve `available`; `getToolBySlug` acha e devolve `undefined` para slug inexistente.
- **Testing Library:**
  - `ToolCard` vira link só quando `available`; `soon` mostra "Em breve" e não tem `href`; chips de formato renderizados
  - `SiteHeader` e `SiteFooter` listam as ferramentas do registro; o botão do menu tem nome acessível e `popovertarget`
  - `AdSlot` não renderiza nada sem a variável em produção; em dev mostra o contorno com "Publicidade"; a altura mínima segue a posição
  - Home: um único `h1`, as seções previstas e um card por ferramenta do registro
- **Playwright (desktop e mobile):**
  - A home responde 200, tem um `h1` e passa no axe nos temas claro e escuro
  - O link de pular é o primeiro foco e leva ao `main`
  - No celular, o menu abre pelo botão, mostra as ferramentas e fecha com Esc
  - Os atalhos por intenção rolam até o card certo
  - Sem rolagem horizontal em 360px
  - No `/styleguide` (dev), o `ToolPageLayout` mostra a área da ferramenta acima da dobra no celular, e o `AdSlot` não fica colado a ela

## Variáveis de ambiente novas

| Nome                            | Finalidade                                                                 | Onde obter                                            |
| ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Ativa a reserva de espaço dos anúncios. O script em si só entra na fase 14 | Painel do AdSense (`ca-pub-...`), depois da aprovação |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] O nome "Tools Fácil" aparece só em `site-config.ts` no código
- [ ] Home, header e footer leem as ferramentas só do `tools.ts` (nenhuma lista solta)
- [ ] Ferramentas `soon` não geram links (nenhum link quebrado na home)
- [ ] Um único `h1` por página; link "Pular para o conteúdo" funcionando
- [ ] Menu mobile abre e fecha pelo teclado e pelo toque, sem JavaScript próprio
- [ ] `AdSlot` com altura reservada, nunca colado à área da ferramenta, sem script do AdSense
- [ ] Sem rolagem horizontal em 360px; alvos de toque de 44px
- [ ] axe sem violações na home, nos dois temas
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Decisões confirmadas

- **Nome:** "Tools Fácil" (domínio sugerido `toolsfacil.com.br`, ainda não registrado).
- **Ferramentas "Em breve":** as 4 do MVP aparecem na home desde já, sem link.
- **Roteiro:** aprovado com a CSP na fase 04, compactar na 07, HEIC na 09 e a fase nova de identidade visual na 12.
- **Seguindo as recomendações do plano** (sem objeção do usuário): o card de destaque é o Conversor para WebP, a textura de xadrez entra no hero e `NEXT_PUBLIC_ADSENSE_CLIENT_ID` vai para o `.env.example` nesta fase.

## Ideias para depois (fora desta fase)

- **Soltar a imagem na home:** o usuário solta um arquivo em qualquer lugar da home e o site sugere a ferramenta pelo tipo (HEIC → "Converter para JPG", PNG grande → "Compactar"). Depende da fase 05; pode virar uma fase própria depois da 06.
- **Paleta de comandos (⌘K)** para buscar ferramentas, quando houver mais de ~8.
- **Funcionar offline (PWA)**, que reforçaria a prova de privacidade ("desligue a internet e continue usando"). Exige cuidado com as bibliotecas carregadas sob demanda (HEIC/WASM).

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
