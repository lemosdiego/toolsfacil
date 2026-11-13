# 10 — Converter PNG e JPG para WebP

**Status:** 📝 Rascunho · **Branch:** `feat/10-converter-png-e-jpg-para-webp` · **Depende de:** 08 e 09

## Objetivo

Publicar as **duas primeiras ferramentas reais**: `/png-para-webp` e `/jpg-para-webp`. A pessoa escolhe a imagem, vê a prévia e o tamanho antes e depois, e baixa o `.webp`, tudo no navegador.

São duas rotas porque são duas buscas diferentes no Google ("png para webp" e "jpg para webp"), cada uma com título, texto e perguntas frequentes próprios. A ilha da ferramenta é uma só.

Esta fase também é a primeira a usar de ponta a ponta o molde da página (05), o SEO (08) e as peças de envio e download (09). Ela confirma que uma ferramenta nova sai rápido.

## Referência visual

O molde da fase 05, sem layout novo:

```
   Converter PNG para WebP  (h1)    ┌──────────────────────┐
                                    │                  [⬇] │  baixar foto.webp
   Texto curto: o que faz,          │                      │
   em 2 ou 3 linhas                 │       Prévia         │
                                    │                      │
   [ Escolher imagem ]              │  1,2 MB → 340 KB     │
   Qualidade  ──────●──  80         │  (−72%)              │
   A imagem não sai do seu aparelho └──────────────────────┘

   ─────────── espaço de segurança + anúncio ───────────
   O que é WebP · Como usar · Perguntas frequentes · Privacidade
```

## Escopo

- **Inclui:**
  - **Rotas** `src/app/(tools)/png-para-webp/page.tsx` e `jpg-para-webp/page.tsx` (Server Components) com o `ToolPageLayout`:
    - `h1` e `title` do mapa de rotas (fase 07)
    - Metadados com `createToolMetadata()` e JSON-LD `WebApplication` + `FAQPage` pelo `JsonLd` (fase 08)
    - Texto original: o que é WebP (e por que é mais leve), como usar em 3 passos, 4 a 6 perguntas frequentes e o aviso de privacidade. Textos diferentes nas duas páginas (transparência no PNG; fotos e lojas virtuais no JPG)
  - **Ilha `WebpConverter`** (`"use client"`), com o `useImageTool` da fase 09:
    - Aceita **PNG e JPG nas duas páginas**: o processo é o mesmo, e recusar um JPG na página do PNG só atrapalharia
    - Controle **"Qualidade"** (50 a 100, padrão 80), que refaz a conversão ao soltar o controle
    - Transparência do PNG preservada
    - Aviso honesto quando o WebP sai **maior** que o original (acontece com PNG pequeno ou já otimizado), mantendo o download
  - **Navegador sem WebP no canvas (Safari):** detectado pelo `canEncode("image/webp")` da fase 09. Nesse caso, carrega sob demanda um **codificador WASM de WebP**, dentro do Web Worker
  - **Status `available`** para as duas ferramentas no `tools.ts`: viram link no menu, entram no sitemap e saem da 404
  - Atualizar o `CLAUDE.md` (decodificador e codificador escolhidos, em "Pontos em aberto" quando for o caso)
- **Não inclui:**
  - Outras saídas (AVIF, JPG) e conversão em lote
  - WebP sem perdas (_lossless_) como opção
  - Compactar, cortar e HEIC (fases próprias)

## Decisões técnicas

| Decisão                                                                                                                                      | Motivo                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duas rotas, uma ilha** (`WebpConverter` com o tipo da página só para os textos)                                                            | Cada rota mira uma busca. A conversão e os testes ficam num lugar só                                                                                                                     |
| **PNG e JPG aceitos nas duas páginas**                                                                                                       | Quem chega pela busca "png para webp" com um JPG na mão quer o mesmo resultado. Um HEIC continua recusado, com a sugestão do conversor HEIC                                              |
| **Qualidade padrão 80, com controle de 50 a 100**                                                                                            | 80 costuma reduzir bastante o tamanho sem diferença visível. O controle atende designers e desenvolvedores sem atrapalhar quem só quer baixar                                            |
| **Refaz a conversão ao soltar o controle**, e não a cada movimento                                                                           | Converter uma foto grande a cada passo do controle travaria o celular                                                                                                                    |
| **Safari: codificador WASM carregado com `import()` só quando o canvas não gera WebP**                                                       | A maior parte do público vem do celular, e no iPhone o canvas não gera WebP. A biblioteca não pesa para quem usa Chrome, Edge ou Firefox, e só baixa quando a pessoa escolhe um arquivo  |
| **Candidato ao codificador: `@jsquash/webp`** (libwebp compilada para WASM)                                                                  | Roda em Web Worker, é mantido e não envia nada para fora. **É dependência nova: o peso será conferido (bundlephobia e tamanho do `.wasm`) e precisa da sua aprovação antes de instalar** |
| **WebP maior que o original: avisa e mantém o download**                                                                                     | Honestidade com o usuário: esconder o resultado ou trocar o formato sem avisar seria pior. A dica sugere baixar a qualidade                                                              |
| **Nome de saída `foto.webp`** (via `output-file-name.ts`)                                                                                    | Previsível e testado na fase 09                                                                                                                                                          |
| **JSON-LD `WebApplication`** com `applicationCategory` `MultimediaApplication`, `operatingSystem` "Qualquer (navegador)" e `offers` gratuito | Descreve a ferramenta sem inventar avaliações, notas ou número de usuários                                                                                                               |

## Tarefas

- [ ] Conferir o peso do codificador WASM e pedir a aprovação para instalar
- [ ] Criar a ilha `WebpConverter` com o controle de qualidade e o aviso de arquivo maior
- [ ] Ligar o codificador WASM como reserva, dentro do worker
- [ ] Criar as rotas `/png-para-webp` e `/jpg-para-webp` com textos, FAQ, metadados e JSON-LD
- [ ] Trocar o status das duas ferramentas para `available`
- [ ] Testes de componente e E2E (desktop e mobile)
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(conversor): adiciona conversão de PNG e JPG para WebP com controle de qualidade`
2. `feat(conversor): usa codificador WASM quando o navegador não gera WebP`
3. `feat(conversor): adiciona as páginas PNG para WebP e JPG para WebP`
4. `feat(ferramentas): libera PNG para WebP e JPG para WebP no registro`
5. `test(e2e): verifica a conversão para WebP de ponta a ponta`
6. `docs: registra o conversor de WebP no CLAUDE.md`
7. `docs(plans): registra notas da implementação da fase 10`

Os testes de unidade e de componente entram no mesmo commit do código. A instalação do codificador entra no commit 2, depois da sua aprovação.

## Testes

- **Vitest / Testing Library:**
  - `WebpConverter`: estados (vazio, processando, pronto, erro), aviso de arquivo maior, controle de qualidade com nome acessível e valor anunciado
  - Escolha do codificador: canvas quando `canEncode` é verdadeiro; WASM quando é falso
- **Playwright (desktop e mobile), com as fixtures da fase 09:**
  - PNG com transparência em `/png-para-webp` → download `.webp` com assinatura `RIFF....WEBP`, mesmas dimensões e transparência preservada (pixel transparente continua transparente)
  - JPG de retrato com EXIF 6 em `/jpg-para-webp` → WebP de pé
  - JPG na página do PNG funciona; HEIC dá erro com a sugestão do conversor HEIC
  - Mudar a qualidade refaz a conversão e muda o tamanho
  - **Simulação do Safari:** com o `toBlob` do canvas forçado a devolver PNG (script injetado no teste), o codificador WASM entra e o download continua sendo WebP de verdade
  - **Nenhuma requisição de rede leva o arquivo**
  - `<head>`: `title`, `description`, `canonical`, `og:url` e JSON-LD (`WebApplication` e `FAQPage`)
  - As duas rotas aparecem no `sitemap.xml` e viram link no menu
  - Em 360px, `h1` e botão acima da dobra e sem rolagem horizontal; axe nos dois temas, antes e depois da conversão

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] `/png-para-webp` e `/jpg-para-webp` convertem no navegador e baixam um WebP de verdade, inclusive na simulação do Safari
- [ ] Transparência preservada, foto de pé, tamanho antes e depois e aviso quando o WebP fica maior
- [ ] Texto original, FAQ, metadados e JSON-LD em cada página
- [ ] As duas ferramentas aparecem como link no menu e no sitemap
- [ ] Nenhuma requisição leva o arquivo; Lighthouse mobile ≥ 90 nas duas páginas
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Dependência nova (`@jsquash/webp` ou equivalente):** necessária para o iPhone gerar WebP. O peso é conferido antes, e a instalação só acontece com a sua aprovação. Sem ela, quem usa Safari veria só uma mensagem pedindo outro navegador.
- **Controle de qualidade:** fica visível ao lado do botão. A alternativa é escondê-lo em "Opções avançadas".
- **PNG e JPG nas duas páginas:** em vez de recusar o formato "da outra página".

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
