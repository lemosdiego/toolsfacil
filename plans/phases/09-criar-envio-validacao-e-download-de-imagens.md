# 09 — Criar envio, validação e download de imagens

**Status:** 🚧 Em andamento · **Branch:** `feat/09-criar-envio-validacao-e-download-de-imagens` · **Depende de:** 05 e 08

## Objetivo

Criar as **peças que todas as ferramentas reaproveitam**: escolher ou arrastar a imagem, conferir o tipo real e o tamanho, processar sem travar a tela (Web Worker) e baixar o resultado com um nome previsível. Tudo no navegador, sem nenhum byte sair do aparelho.

Ao final, cada ferramenta (WebP, compactar, cortar, HEIC) só diz **o que aceita** e **o que faz com a imagem**. Escolha, validação, estados da tela, prévia, memória e download já vêm prontos. O exemplo do styleguide (`/styleguide/ferramenta`) passa a usar o fluxo real e serve de bancada de testes.

## Escopo

- **Inclui:**
  - **Funções puras em `src/lib/image/`**, com testes:
    - `detect-image-type.ts`: tipo real pelos primeiros bytes (PNG, JPEG, WebP, GIF, HEIC/HEIF e AVIF, pela "marca" do `ftyp`)
    - `read-image-dimensions.ts`: largura e altura lidas do cabeçalho (PNG, JPEG e WebP), sem decodificar a imagem
    - `validate-image.ts`: junta tipo, tamanho do arquivo e dimensões, e devolve o resultado ou um erro com a mensagem em português
    - `image-limits.ts`: os limites (20 MB por arquivo; até 16.777.216 pixels de área e 16.384 px de lado)
    - `image-formats.ts`: tipo MIME → rótulo ("PNG"), extensão e o `accept` do seletor
    - `output-file-name.ts`: `foto.PNG` → `foto.webp`, `foto-cortada.jpg`; nome vazio ou estranho → `imagem.webp`
  - **Formatos aceitos no registro:** campo `accepts` em cada ferramenta do `tools.ts` e a consulta `getToolsForFileType()` (usados na validação e, depois, no roteador da home)
  - **Processamento** (`src/lib/image/process-image.ts` + `src/workers/image.worker.ts`):
    - Decodifica com `createImageBitmap(file, { imageOrientation: "from-image" })`, desenha no canvas e codifica para o tipo pedido, com qualidade opcional
    - Roda num **Web Worker com `OffscreenCanvas`** quando o navegador suporta; senão, na thread principal
    - `canEncode(tipo)`: descobre se o navegador gera aquele formato pelo canvas (ex.: o Safari não gera WebP) e guarda a resposta. A ferramenta decide o que fazer quando não gera
    - Libera a memória: `bitmap.close()` e encerra o worker ao trocar de imagem ou sair da página
  - **Interface** (`src/components/tools/`, `"use client"`):
    - `ImagePicker`: botão "Escolher imagem" + `<input type="file">` escondido, com o `accept` da ferramenta (no celular, abre câmera ou galeria)
    - Área de soltar: no desktop, a prévia vazia vira o alvo de arrastar e soltar ("Arraste uma imagem para cá"), e também abre o seletor ao clicar
    - `useImageTool`: estados `vazio → conferindo → processando → pronto | erro`, com a imagem de origem, o resultado, as URLs `blob:` (revogadas ao trocar e ao sair) e "Trocar imagem"
    - Estados claros: `Spinner` com texto durante o processamento, `Alert` de erro com o que fazer, e a prévia com o tamanho antes e depois
    - Aviso de privacidade no texto de apoio do botão ("A imagem não sai do seu aparelho. Os metadados, como a localização, são removidos.")
  - **Download:** o ícone do `PreviewCard` baixa o resultado com o nome de `output-file-name.ts`
  - **Exemplo do styleguide com o fluxo real:** escolher → validar → processar (regrava em PNG) → prévia → baixar
  - **Fixtures em `tests/fixtures/`**, geradas por um script (`scripts/generate-fixtures.mjs`) com o Chromium do Playwright e versionadas: PNG com transparência, JPG comum, JPG de retrato com EXIF de orientação 6, WebP, PNG com dimensões acima do limite e um "falso PNG" (texto com extensão `.png`)
  - Atualizar o `README.md` das fixtures e o `CLAUDE.md` (peças da ferramenta, limites e como usar)
- **Não inclui:**
  - Nenhuma ferramenta real (WebP, compactar, cortar e HEIC têm fase própria)
  - Decodificar HEIC (biblioteca pesada, na fase do HEIC). Aqui o HEIC só é **reconhecido**, para a mensagem certa
  - Várias imagens de uma vez (lote) e `.zip`
  - Colar imagem da área de transferência

## Decisões técnicas

| Decisão                                                                                                    | Motivo                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tipo pelo conteúdo, nunca pela extensão** (assinatura dos primeiros bytes)                               | Regra do `CLAUDE.md`. Pega o "falso PNG" e a foto do iPhone salva como `.jpg` que na verdade é HEIC                                                                                                                                                                   |
| **Dimensões lidas do cabeçalho antes de decodificar**                                                      | Decodificar uma imagem gigante só para descobrir que ela passa do limite pode travar ou derrubar a aba no celular. O cabeçalho dá largura e altura sem gastar memória                                                                                                 |
| **Limite de área de 16.777.216 px** (equivale a 4096 × 4096) **e 16.384 px de lado**                       | É o teto do canvas no Safari do iOS, o mais restrito. Um limite único evita "funciona no PC e falha no iPhone". A mensagem diz as dimensões da imagem e o máximo                                                                                                      |
| **20 MB por arquivo**                                                                                      | Cobre fotos de celular (em geral de 2 a 12 MB) com folga, e protege a memória dos aparelhos mais simples. Ajustável por ferramenta, se preciso                                                                                                                        |
| **`accepts` no registro**, e não em cada página                                                            | Uma fonte só da verdade: a validação, o `accept` do seletor e o roteador da home (fase 06) leem do mesmo lugar                                                                                                                                                        |
| **Arquivo de outro tipo: o erro sugere a ferramenta certa** (pelo `getToolsForFileType()`)                 | Ex.: HEIC no conversor de WebP → "Essa é uma foto HEIC (do iPhone). Use o conversor HEIC para JPG.", com link quando a ferramenta estiver pronta                                                                                                                      |
| **Web Worker com `OffscreenCanvas`, e a thread principal como reserva**                                    | Regra do `CLAUDE.md`: processamento pesado não trava a tela. A reserva cobre navegadores sem `OffscreenCanvas`                                                                                                                                                        |
| **`canEncode()` detecta o suporte de verdade** (codifica uma imagem de 1 px e confere o tipo do resultado) | O navegador sem suporte devolve PNG em silêncio quando se pede WebP (caso do Safari). Sem essa checagem, o usuário baixaria um PNG com nome `.webp`                                                                                                                   |
| **A orientação do EXIF é aplicada e os metadados saem**                                                    | `imageOrientation: "from-image"` deixa a foto de pé. Regravar pelo canvas remove o EXIF (inclusive o GPS), e isso aparece na interface como ganho de privacidade                                                                                                      |
| **Uma imagem por vez**: se a pessoa soltar várias, vale a primeira, com um aviso                           | O lote fica fora do MVP. O aviso evita a impressão de que as outras foram processadas                                                                                                                                                                                 |
| **Download por link `<a download>` com a URL `blob:`** (o que o `PreviewCard` já faz)                      | Funciona em todos os navegadores atuais, inclusive no iOS, sem biblioteca. A URL é revogada ao trocar de imagem e ao sair da página                                                                                                                                   |
| **Fixtures geradas por script com o Chromium do Playwright**                                               | A máquina não tem ImageMagick nem exiftool, e o Playwright já está no projeto. O script desenha as imagens no canvas e grava a orientação do EXIF direto nos bytes. As imagens ficam versionadas (pequenas, sem dados pessoais), e o script documenta como recriá-las |
| **Sem bibliotecas novas**                                                                                  | APIs nativas (`createImageBitmap`, `OffscreenCanvas`, `Worker`, `Blob`) resolvem tudo. A primeira biblioteca pesada (decodificador de HEIC ou codificador WASM) entra na fase da ferramenta que precisar                                                              |

## Tarefas

- [ ] Criar `detect-image-type`, `read-image-dimensions`, `image-limits`, `image-formats`, `validate-image` e `output-file-name`, com testes
- [ ] Adicionar `accepts` ao registro e `getToolsForFileType()`, com testes
- [ ] Criar o worker, o `process-image` (com a reserva na thread principal) e o `canEncode()`
- [ ] Criar o `ImagePicker`, a área de soltar e o `useImageTool`
- [ ] Ligar o download do `PreviewCard` ao resultado
- [ ] Trocar o exemplo do styleguide pelo fluxo real
- [ ] Criar o script das fixtures e gerar as imagens
- [ ] Testes de componente e E2E (desktop e mobile)
- [ ] Atualizar o README das fixtures e o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(imagem): detecta o tipo real e lê as dimensões pelo cabeçalho`
2. `feat(imagem): valida tipo, tamanho e dimensões com mensagens em português`
3. `feat(imagem): gera o nome do arquivo de saída`
4. `feat(ferramentas): adiciona formatos aceitos ao registro de ferramentas`
5. `feat(imagem): processa imagens em Web Worker com OffscreenCanvas`
6. `feat(ferramentas): adiciona escolha, área de soltar e estados da ferramenta`
7. `feat(styleguide): usa o fluxo real de imagem no exemplo da ferramenta`
8. `test(fixtures): adiciona script e imagens de teste`
9. `test(e2e): verifica escolha, validação, processamento e download`
10. `docs: registra as peças das ferramentas no CLAUDE.md`
11. `docs(plans): registra notas da implementação da fase 09`

Os testes de unidade e de componente entram no mesmo commit do código.

## Testes

- **Vitest:**
  - `detect-image-type`: bytes de PNG, JPEG, WebP, GIF, HEIC (`heic`, `heix`, `mif1`), AVIF; texto e arquivo vazio → desconhecido
  - `read-image-dimensions`: PNG (IHDR), JPEG (SOF0 e SOF2, pulando outros segmentos), WebP (VP8, VP8L e VP8X); cabeçalho cortado → sem dimensões
  - `validate-image`: tipo aceito, tipo errado (com sugestão de ferramenta), acima de 20 MB, acima do limite de área e de lado, nas mensagens em português
  - `output-file-name`: troca de extensão, sufixo (`-cortada`), maiúsculas, vários pontos, nome vazio, caracteres estranhos
  - `getToolsForFileType()`: ferramentas certas por tipo, na ordem do registro; toda ferramenta aceita pelo menos um tipo
  - `useImageTool` e `ImagePicker` (Testing Library): estados, mensagem de erro em `role="alert"`, "Trocar imagem" volta ao vazio e revoga as URLs
- **Playwright (desktop e mobile), no `/styleguide/ferramenta` com as fixtures:**
  - PNG com transparência → prévia → download com o nome certo, assinatura PNG e as mesmas dimensões
  - JPG de retrato com EXIF 6 → a saída sai de pé (largura e altura trocadas)
  - Falso PNG → erro de tipo; PNG acima do limite de área → erro com as dimensões; arquivo acima de 20 MB (gerado no teste) → erro de tamanho
  - Arrastar e soltar no desktop
  - **Nenhuma requisição de rede leva o arquivo:** nenhuma requisição com corpo e nenhuma URL com o nome do arquivo durante a escolha, o processamento e o download
  - Em 360px, botão acima da dobra e sem rolagem horizontal; axe nos dois temas, antes e depois do processamento, e no estado de erro

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

> Os valores são preenchidos manualmente pelo usuário. Aqui só entra o nome, e ele também vai para o `.env.example`.

## Critérios de aceite

- [ ] Escolher ou arrastar a imagem funciona no desktop e no celular, com o `accept` da ferramenta
- [ ] O tipo é conferido pelos bytes; tamanho e dimensões fora do limite dão erro claro, em português e com o que fazer
- [ ] O processamento roda em Web Worker (com reserva), sem travar a tela, e a foto sai de pé e sem EXIF
- [ ] O download sai com o nome previsível, e o tamanho antes e depois aparece
- [ ] URLs `blob:` revogadas e `bitmap.close()` chamado; nenhuma requisição leva o arquivo
- [ ] O exemplo do styleguide usa o fluxo real
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Limites:** 20 MB por arquivo e 16,7 milhões de pixels de área (4096 × 4096). Um limite maior funcionaria no computador, mas falharia no iPhone.
- **Área de soltar só no desktop:** no celular, o botão "Escolher imagem" já abre câmera e galeria, e arrastar arquivo não existe.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
