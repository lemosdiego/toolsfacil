# 13 — Converter HEIC para JPG

**Status:** 📝 Rascunho · **Branch:** `feat/13-converter-heic-para-jpg` · **Depende de:** 09 e 10

## Objetivo

Publicar a ferramenta **`/heic-para-jpg`**: abrir as fotos do iPhone (HEIC/HEIF) e salvá-las em JPG, que abre em qualquer lugar (Windows, formulários, sites, WhatsApp Web), sem enviar a foto para nenhum servidor.

É a fase de maior risco técnico do MVP. Só o Safari decodifica HEIC sozinho. Nos outros navegadores, o decodificador é uma biblioteca WASM pesada, e as fotos de iPhones recentes passam do limite de pixels do canvas. Por isso a primeira tarefa é um **protótipo** que prova o decodificador dentro do worker, no build de produção e com a CSP atual, antes de construir a página.

## Referência visual

O mesmo molde dos conversores de WebP (fase 10): botão, controle de qualidade e a prévia à direita. A diferença é o aviso de carregamento do decodificador na primeira foto ("Preparando o leitor de HEIC…", com barra de progresso).

## Escopo

- **Inclui:**
  - **Protótipo** do decodificador no Web Worker, no `next build`, com a CSP de produção (sem `unsafe-eval`)
  - **Rota** `src/app/(tools)/heic-para-jpg/` no molde das rotas. `h1`: "Converter HEIC para JPG"
  - **Ilha `HeicConverter`** (`src/components/tools/`), sobre `useImageTool` + `ImageToolView`:
    - Saída **JPG**, com qualidade de 60 a 100 (padrão 90) refeita ao parar de mexer
    - Aviso de progresso enquanto o decodificador carrega (só na primeira foto)
    - Aviso quando a foto foi reduzida para caber no limite do navegador, com as dimensões antes e depois
  - **Decodificação em duas etapas** (`src/lib/image/heic-decoder.ts`), no worker:
    1. **Nativa:** `createImageBitmap` (Safari 17 ou mais recente decodifica HEIC)
    2. **WASM:** `libheif-js` carregado com `import()`, só se a nativa falhar
  - **Dimensões do HEIC pelo cabeçalho:** `readImageDimensions` passa a ler a caixa `ispe` (função pura, com testes). Assim a validação e a ilha sabem o tamanho antes de decodificar
  - **Fotos acima do limite** (16,7 milhões de pixels): decodificadas já reduzidas, mantendo a proporção, até caber. É o caso dos 24 e 48 MP dos iPhones Pro recentes
  - **Orientação:** aplica as transformações do HEIC (`irot`/`imir`) e confere que a foto sai de pé
  - **Nome de saída:** `IMG_1234.jpg`
  - **Fixture** `foto.heic` pequena, gerada a partir de uma imagem desenhada pelo script, sem dados pessoais (ver "Pontos para a revisão")
  - **Status `available`** no `tools.ts`: link no menu, sitemap, grade da home e ação "Converter para JPG" do roteador
  - Créditos e licença da biblioteca (LGPL) registrados para a página Sobre (fase das institucionais)
  - Atualizar o `CLAUDE.md` (decodificador de HEIC, ponto em aberto resolvido)
- **Não inclui:**
  - HEIC para PNG ou WebP (dá para somar depois com a mesma decodificação)
  - Fotos ao vivo (Live Photos) e sequências: só a imagem principal
  - Várias fotos de uma vez (lote com `.zip`), mesmo sendo um pedido comum: fica para uma fase própria
  - AVIF

## Decisões técnicas

| Decisão                                                                    | Motivo                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nativo primeiro, WASM só se precisar**                                   | No iPhone e no Mac com Safari, a foto abre sem baixar nada. O WASM só pesa para quem precisa (Chrome, Edge e Firefox)                                                                                                                                                                                               |
| **`libheif-js` 1.23.5** (LGPL-3.0, `.wasm` de ~484 KB gzip + ~29 KB de JS) | Segue o libheif atual (fotos de iPhones novos), e o `.wasm` vem em arquivo separado: fica em cache e não pesa no JS. Alternativas medidas: `heic-to` 1.6.7 (LGPL, ~790 KB com o WASM embutido em base64, tem build sem `eval`) e `heic2any` 0.0.4 (MIT, ~340 KB, sem atualização desde 2023, com um libheif antigo) |
| **LGPL usada sem modificar, carregada à parte**                            | A LGPL permite usar a biblioteca num site fechado se ela não for alterada e o usuário puder trocá-la. Um arquivo `.wasm` separado e sem mudanças atende. A página Sobre cita a biblioteca, a licença e o link do código                                                                                             |
| **Protótipo antes da página**                                              | Turbopack + `new URL(...)` para o `.wasm` dentro do worker + CSP sem `unsafe-eval` são três riscos juntos. Se o `libheif-js` não passar, o plano B é o `heic-to/csp`                                                                                                                                                |
| **Reduzir em vez de recusar fotos grandes**                                | Recusar as fotos de 24 MP de um iPhone 15 Pro quebraria o uso principal. Decodificar reduzido (até 16,7 MP, ex.: 5712 × 4284 vira cerca de 4730 × 3547) mantém a foto útil, e o aviso explica                                                                                                                       |
| **Qualidade padrão 90**                                                    | Quem converte uma foto quer guardá-la ou enviá-la, não economizar ao máximo. 90 fica perto do original e menor que o HEIC convertido sem perdas                                                                                                                                                                     |
| **`ispe` no cabeçalho**                                                    | Hoje as dimensões do HEIC são "desconhecidas" e passam na validação. Lendo a caixa `ispe`, a ilha decide antes se precisa reduzir, sem decodificar à toa                                                                                                                                                            |

## Tarefas

- [ ] Protótipo: `libheif-js` no worker, no build de produção, com a CSP atual (e o plano B, se falhar)
- [ ] Confirmar a escolha da biblioteca e pedir a aprovação para instalar
- [ ] Ler a caixa `ispe` em `readImageDimensions`, com testes
- [ ] Criar `heic-decoder.ts` (nativo → WASM, com redução até o limite)
- [ ] Criar a fixture `foto.heic` e registrá-la no README das fixtures
- [ ] Criar a ilha `HeicConverter` (qualidade, progresso, aviso de redução)
- [ ] Criar a rota `/heic-para-jpg` com textos, FAQ, metadados e JSON-LD
- [ ] Trocar o status para `available`
- [ ] Testes de componente e E2E (desktop e mobile, dev e produção)
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(imagem): lê as dimensões do HEIC pelo cabeçalho`
2. `feat(imagem): decodifica HEIC no worker, nativo ou com libheif`
3. `test(fixtures): adiciona foto HEIC de teste`
4. `feat(heic): adiciona conversão de HEIC para JPG`
5. `feat(heic): adiciona a página Converter HEIC para JPG`
6. `feat(ferramentas): libera HEIC para JPG no registro`
7. `test(e2e): verifica a conversão de HEIC de ponta a ponta`
8. `docs: registra o decodificador de HEIC no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 13`

## Testes

- **Vitest:**
  - `readImageDimensions` com HEIC: lê a `ispe` (inclusive depois de outras caixas), devolve `undefined` com cabeçalho cortado
  - `heic-decoder`: usa o nativo quando funciona; cai no WASM quando o nativo falha; calcula o tamanho reduzido acima do limite; erro de decodificação vira `decode-failed`
  - `HeicConverter`: qualidade com nome acessível, aviso de redução, progresso
- **Playwright (desktop e mobile, dev e produção):**
  - `foto.heic` → JPG de verdade, com as dimensões esperadas e o nome `foto.jpg` (no Chromium, pelo caminho WASM)
  - O `.wasm` carrega só depois de escolher a foto, com status 200
  - Página PNG/JPG para WebP com HEIC: a mensagem passa a ter o link para esta ferramenta
  - **Nenhuma requisição leva o arquivo**
  - Home: a ação "Converter para JPG" vira link e leva a foto até a ferramenta
  - `<head>`, JSON-LD, sitemap, menu, 360px e axe nos dois temas; página no teste de CSP (sem violação com o WASM)
- **Manual (Safari real):** o caminho nativo não roda no CI (só há Chromium). Conferir num iPhone ou Mac, com o passo a passo nas notas

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [ ] `/heic-para-jpg` converte fotos HEIC em JPG no navegador, de pé e com o tamanho certo
- [ ] Fotos acima do limite saem reduzidas, com aviso
- [ ] O decodificador WASM só carrega quando o navegador não abre HEIC sozinho
- [ ] Texto original, FAQ, metadados e JSON-LD; link no menu, na home e no sitemap
- [ ] Nenhuma requisição leva o arquivo
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Biblioteca: `libheif-js` 1.23.5 (LGPL-3.0).** A licença pede o crédito e o link do código (vai na página Sobre). Se preferir evitar a LGPL, a opção MIT é o `heic2any`, mais leve, porém parado desde 2023 e com o risco de não abrir fotos de iPhones novos.
- **Peso:** ~0,5 MB baixado uma vez, e só por quem usa Chrome, Edge ou Firefox nesta página.
- **Fixture HEIC:** o Chromium não gera HEIC. Proposta: gerar com o `heif-enc` (ferramenta de linha de comando do libheif) a partir de um PNG desenhado pelo script, e commitar o arquivo. Ele precisaria estar instalado na sua máquina (`sudo apt install libheif-examples`), ou você pode me enviar uma foto HEIC sua sem localização.
- **Fotos grandes reduzidas** para até 16,7 milhões de pixels, em vez de recusadas.
- **Lote fora desta fase**, mesmo sendo comum para quem converte fotos do iPhone.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
