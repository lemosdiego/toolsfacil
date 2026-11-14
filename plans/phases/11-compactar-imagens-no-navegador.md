# 11 — Compactar imagens no navegador

**Status:** 🔍 Em revisão · **Branch:** `feat/11-compactar-imagens-no-navegador` · **Depende de:** 09 e 10

## Objetivo

Publicar a ferramenta **`/compactar-imagem`**: reduzir o tamanho em KB de uma imagem **sem trocar o formato** e sem perda visível. Um JPG continua JPG, um PNG continua PNG e um WebP continua WebP. A pessoa vê o tamanho antes e depois e baixa o resultado, tudo no navegador.

Além da compactação por qualidade, a fase traz o modo **"Tamanho máximo"** ("deixar a foto com até 100 KB"). É uma necessidade comum de quem envia foto para formulário de inscrição, concurso ou cadastro em órgão público, e também uma busca frequente.

A fase reaproveita quase tudo das fases 09 e 10: `useImageTool`, `ImageToolView`, o Web Worker e o codificador WebP em WASM para o Safari.

## Referência visual

O molde da fase 05, com as opções abaixo do botão:

```
   Compactar imagem  (h1)           ┌──────────────────────┐
                                    │                  [⬇] │  baixar foto-compactada.jpg
   Texto curto: reduz os KB         │                      │
   sem trocar o formato             │       Prévia         │
                                    │                      │
   [ Escolher imagem ]              │  2,4 MB → 610 KB     │
                                    │  (−75%)              │
   ( • Qualidade  ○ Tamanho máximo ) └──────────────────────┘
   Qualidade  ─────●───  75
   A imagem não sai do seu aparelho

   ─────────── espaço de segurança + anúncio ───────────
   Como compactar · Dicas · Perguntas frequentes · Privacidade
```

No modo "Tamanho máximo", o controle de qualidade dá lugar a atalhos (100 KB, 200 KB, 500 KB, 1 MB) e a um campo para outro valor em KB.

## Escopo

- **Inclui:**
  - **Rota** `src/app/(tools)/compactar-imagem/page.tsx` no molde das rotas (`requireTool`, `createToolMetadata`, `JsonLd`, `content.ts`, `FaqList`), com o `h1` e o `title` do mapa de rotas
  - **Ilha `ImageCompressor`** (`src/components/tools/`), sobre `useImageTool` + `ImageToolView`:
    - **JPG e WebP:** regravados no mesmo formato, com **qualidade de 40 a 95 (padrão 75)**, convertendo de novo quando a pessoa para de mexer
    - **PNG:** otimização **sem perdas** com o oxipng (WASM), sem controle de qualidade. Um aviso sugere o conversor PNG para WebP para reduzir muito mais
    - **Modo "Tamanho máximo"** (JPG e WebP): busca a maior qualidade que cabe no limite. Se nem a qualidade mínima couber, entrega o menor resultado e avisa (sugere reduzir as dimensões)
    - Aviso honesto quando o resultado não fica menor que o original ("Essa imagem já está bem otimizada")
    - WebP no Safari com o codificador WASM da fase 10
  - **Funções puras (`src/lib/image/`), com testes:**
    - `find-quality-for-size.ts`: busca binária da qualidade que cabe no tamanho máximo, com limite de tentativas
    - `compression-settings.ts`: padrões e limites (qualidade, atalhos de tamanho, formato de saída por tipo de entrada)
  - **Processamento:** opção `optimizePng` no `processImage`, que carrega o oxipng com `import()` dentro do worker (só para PNG, só quando a pessoa escolhe um arquivo)
  - **Nome de saída:** `foto-compactada.jpg` (sufixo `compactada`, mesmo formato)
  - **Fixture nova:** `foto-detalhada.jpg`, uma foto com textura e alta qualidade (até 200 KB) em que a compactação faz diferença de verdade
  - **Status `available`** no `tools.ts`: a ferramenta vira link no menu, no sitemap, na grade da home e na ação "Compactar" do roteador
  - Atualizar o `CLAUDE.md` (compactação, oxipng e o ponto em aberto "Compactação de PNG")
- **Não inclui:**
  - Compactação de PNG **com perdas** (quantização de cores, no estilo TinyPNG): fica como evolução, com biblioteca e plano próprios
  - Redimensionar como parte da compactação (é da ferramenta de cortar e redimensionar)
  - Várias imagens de uma vez (lote) e `.zip`
  - HEIC e AVIF

## Decisões técnicas

| Decisão                                                                                     | Motivo                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mantém o formato de entrada**                                                             | Quem quer trocar de formato já tem os conversores. Quem compacta quase sempre precisa do mesmo tipo de arquivo (um formulário que só aceita JPG, por exemplo)                                                               |
| **Qualidade padrão 75** (40 a 95)                                                           | Para compactar, o ponto de partida pode ser um pouco mais agressivo que o 80 do conversor de WebP, mantendo a perda invisível na maioria das fotos. O controle resolve os casos que pedem mais detalhe                      |
| **PNG sem perdas com oxipng** (WASM, carregado sob demanda no worker)                       | O canvas não compacta PNG de forma eficiente: regravar pelo canvas muitas vezes até aumenta o arquivo. O oxipng recomprime sem mudar nenhum pixel e recupera esse tamanho                                                   |
| **Versão single-thread do oxipng**                                                          | A versão com threads exige os cabeçalhos COOP/COEP, que atrapalham o AdSense. A single-thread é menor (~76 KB gzip) e suficiente para uma imagem por vez                                                                    |
| **PNG com perdas fora desta fase**                                                          | A redução grande no PNG vem de diminuir a paleta de cores, e isso altera a imagem. Fica para uma fase própria, depois de avaliar a biblioteca. Até lá, o aviso sugere o WebP, que reduz bem mais e mantém a transparência   |
| **Modo "Tamanho máximo" com busca binária** (até 7 tentativas, qualidade entre 0,30 e 0,95) | 7 tentativas bastam para chegar a uma diferença de 1% na qualidade, em poucos segundos mesmo no celular. A função é pura: recebe "codificar com a qualidade q" e o limite, e devolve o melhor resultado. Testada sem canvas |
| **Se nem a qualidade mínima cabe, entrega o menor e avisa**                                 | Melhor que falhar sem nada: a pessoa vê quanto faltou e recebe a sugestão de reduzir as dimensões                                                                                                                           |
| **Resultado maior que o original: avisa** e mantém o download                               | Acontece com imagens já otimizadas. Esconder o resultado confundiria; o aviso explica e sugere outra qualidade (ou o WebP, no caso do PNG)                                                                                  |
| **Remove os metadados** (o canvas regrava)                                                  | Também é parte da compactação: o EXIF de uma foto de celular pode ter dezenas de KB, além da localização                                                                                                                    |
| **Atalhos de tamanho: 100 KB, 200 KB, 500 KB e 1 MB**, mais um campo livre                  | São os limites mais comuns em formulários. O campo cobre o resto                                                                                                                                                            |

## Tarefas

- [x] Conferir de novo o peso do `@jsquash/oxipng` e pedir a aprovação para instalar
- [x] Criar `compression-settings.ts` e `find-quality-for-size.ts`, com testes
- [x] Adicionar `optimizePng` ao `processImage` (oxipng no worker, sob demanda)
- [x] Criar a ilha `ImageCompressor` (qualidade, tamanho máximo, avisos)
- [x] Gerar a fixture `foto-detalhada.jpg` pelo script
- [x] Criar a rota `/compactar-imagem` com textos, FAQ, metadados e JSON-LD
- [x] Trocar o status para `available`
- [x] Testes de componente e E2E (desktop e mobile, dev e produção)
- [x] Atualizar o `CLAUDE.md`
- [x] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(imagem): adiciona busca da qualidade pelo tamanho máximo`
2. `feat(imagem): otimiza PNG sem perdas com oxipng no worker`
3. `feat(compactar): adiciona compactação por qualidade e por tamanho máximo`
4. `test(fixtures): adiciona foto detalhada para a compactação`
5. `feat(compactar): adiciona a página Compactar imagem`
6. `feat(ferramentas): libera Compactar imagem no registro`
7. `test(e2e): verifica a compactação de ponta a ponta`
8. `docs: registra a compactação no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 11`

Os testes de unidade e de componente entram no mesmo commit do código. A instalação do oxipng entra no commit 2, depois da sua aprovação.

## Testes

- **Vitest:**
  - `findQualityForSize`: acha a maior qualidade que cabe (codificador simulado); não passa de 7 tentativas; sem solução, devolve o menor resultado marcado como "não coube"; limite maior que a qualidade máxima devolve a qualidade máxima
  - `compression-settings`: formato de saída igual ao de entrada; PNG sem controle de qualidade; atalhos em bytes
  - `ImageCompressor`: troca de modo, qualidade com nome acessível, atalhos de tamanho, avisos (já otimizada, não coube, dica do WebP no PNG)
- **Playwright (desktop e mobile, dev e produção):**
  - `foto-detalhada.jpg`: o JPG compactado sai menor, com as mesmas dimensões e assinatura JPG, e o nome `foto-detalhada-compactada.jpg`
  - PNG transparente: sai PNG, menor que o original e com a transparência preservada; o oxipng (`.wasm`) carrega
  - WebP continua WebP; na simulação do Safari, o codificador WASM entra
  - Modo "Tamanho máximo" em 100 KB: o arquivo baixado tem no máximo 100 KB
  - Foto com EXIF de orientação 6 sai de pé
  - **Nenhuma requisição leva o arquivo**
  - Home: a ação "Compactar" vira link e leva a imagem até a ferramenta
  - `<head>`, JSON-LD, sitemap, menu, 360px e axe nos dois temas (antes e depois, nos dois modos); página no teste de CSP

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [x] `/compactar-imagem` reduz JPG, PNG e WebP no navegador, mantendo o formato, as dimensões e a orientação
- [x] O modo "Tamanho máximo" entrega um arquivo dentro do limite, ou avisa quanto faltou
- [x] PNG otimizado sem perdas (transparência preservada), com a sugestão do WebP para reduzir mais
- [x] Avisos honestos quando a imagem já está otimizada
- [x] Texto original, FAQ, metadados e JSON-LD; link no menu, na home e no sitemap
- [x] Nenhuma requisição leva o arquivo
- [x] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Dependência nova: `@jsquash/oxipng` 2.3.0** (Apache-2.0, ~76 KB gzip, carregada só para PNG e só ao escolher um arquivo). Sem ela, o PNG "compactado" pelo canvas muitas vezes sai maior que o original.
- **PNG só sem perdas nesta fase:** a redução grande (quantização de cores) fica para depois, com o WebP como sugestão até lá.
- **Modo "Tamanho máximo":** incluído nesta fase. A alternativa é deixá-lo para depois e ter só o controle de qualidade.
- **Qualidade padrão 75**, um pouco abaixo dos 80 do conversor de WebP.

## Notas da implementação

**Desvios do plano**

- **Instalação do oxipng sem nova pergunta:** a dependência (`@jsquash/oxipng` 2.3.0, Apache-2.0, ~76 KB gzip conferidos no `.wasm`) já estava nos pontos de revisão do plano aprovado, então foi instalada direto no commit 2.
- **Busca do tamanho máximo dentro do `encodeImage`** (opção `maxBytes`), e não na ilha: a imagem é decodificada e desenhada uma vez só, e as até 7 codificações rodam no mesmo canvas, dentro do worker, numa só ida e volta. O resultado traz `quality` e `fitsMaxBytes`, e a ilha mostra a "Qualidade usada".
- **Precisão da busca:** as 7 tentativas incluem as duas pontas (0,95 primeiro, que resolve na hora quando já cabe, e 0,30, que detecta o "não coube" com 2 codificações). As 5 restantes chegam a cerca de 2 pontos de qualidade da resposta exata, e não 1%. Na prática, a diferença de tamanho é pequena; dá para subir o teto em `MAX_SIZE_SEARCH` se precisar.
- **PNG otimizado a partir dos pixels** (`optimise_raw`), e não dos bytes originais: assim a orientação do EXIF é aplicada e os metadados saem, como nos outros formatos. `optimiseAlpha` ligado (zera a cor dos pixels 100% transparentes, que é invisível).
- **oxipng importado de `codec/pkg/`** (single-thread) em vez da entrada do pacote: a entrada escolhe a versão com threads dentro de um worker, e ela exige COOP/COEP. Conferido no build: o código de threads não entra.
- **`getFileName(file, sourceType)`** no `useImageTool`: a compactação precisa da extensão do formato de entrada. Os conversores continuam iguais (ignoram o segundo argumento).
- **Aviso extra no modo "Tamanho máximo":** quando o original já cabe no limite e a regravação sai maior, a página diz que dá para usar a imagem original como está.
- **Teste de unidade do roteador e E2E da home:** a ação "Compactar" virou link; os testes passaram a usar "Cortar e redimensionar" como exemplo de "Em breve".

**Conferido no build de produção:** `/compactar-imagem` é estática, o `.wasm` do oxipng sai em `static/media` e só carrega pelo `import()` do worker (nenhuma página o referencia). A simulação do Safari passa em produção.

**Testes:** 272 de unidade e componente; E2E com 221 testes em dev e 151 no build de produção (desktop e mobile), todos passando.

**Pendências**

- **Lighthouse mobile ≥ 90 não foi medido** nesta fase (mesma situação da fase 10). Fica para a fase de auditoria, com o passo a passo das notas da fase 10.
- O Safari real não foi testado (o CI só tem Chromium); a simulação cobre o caminho do WASM.
- Compactação de PNG **com perdas** (quantização) continua fora, como previsto.
