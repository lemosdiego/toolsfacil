# 12 — Cortar e redimensionar com Cropper.js

**Status:** 🚧 Em andamento · **Branch:** `feat/12-cortar-e-redimensionar-com-cropperjs` · **Depende de:** 09 e 11

## Objetivo

Publicar a ferramenta **`/cortador-de-imagem`**: cortar uma imagem livremente ou nas proporções das redes sociais, girar e ajustar a largura e a altura finais, tudo no navegador, com o resultado no **mesmo formato** da original.

É a última ferramenta de edição do MVP. Diferente dos conversores e do compactador, ela **não processa ao escolher**: a pessoa primeiro ajusta o corte num editor, e só depois gera o arquivo. Por isso a fase também ensina o `useImageTool` e o `ImageToolView` a terem uma etapa de edição.

## Referência visual

Não há print em `referencias/projeto/` para esta tela: o desenho abaixo é uma proposta no molde da fase 05. Se você mandar um print, ele substitui este desenho.

```
   Cortar e redimensionar imagem (h1)   ┌──────────────────────────┐
                                        │  ┌────────────────┐      │
   Texto curto                          │  │   seleção do   │      │  editor (Cropper.js)
                                        │  │     corte      │      │  altura fixa, sem CLS
   [ Escolher outra imagem ]            │  └────────────────┘      │
                                        └──────────────────────────┘
   Proporção                            [↺ Girar]
   (Livre) (1:1) (4:5) (9:16) (16:9) (4:3)

   Tamanho final
   Largura [1080] px  🔗  Altura [1080] px

   [ Cortar imagem ]  ← gera o arquivo; a prévia troca para o resultado com download
   A imagem não sai do seu aparelho

   ─────────── espaço de segurança + anúncio ───────────
   Como cortar · Tamanhos para redes sociais · Perguntas frequentes · Privacidade
```

Depois de "Cortar imagem", a área da direita mostra o `PreviewCard` com o resultado, o download e os tamanhos, e o botão "Voltar a editar" reabre o editor com o mesmo corte.

## Escopo

- **Inclui:**
  - **Rota** `src/app/(tools)/cortador-de-imagem/` no molde das rotas (`requireTool`, `createToolMetadata`, `JsonLd`, `content.ts`, `FaqList`). `h1`: "Cortar e redimensionar imagem"
  - **Etapa de edição no `useImageTool`**: opção `processOnSelect: false`. Depois de validar, o estado vai para `editing` (com a URL `blob:` da original para o editor) e só processa quando a ilha chamar `apply()`. `backToEditing()` volta do resultado para o editor. Os conversores e o compactador não mudam
  - **`ImageToolView`** aceita um `editor` no lugar da prévia enquanto o estado é `editing`
  - **Ilha `ImageCropper`** (`src/components/tools/`):
    - Editor com **Cropper.js** carregado por `import()` só quando a imagem é escolhida, numa caixa de altura fixa (sem CLS)
    - **Proporções:** Livre, 1:1 (feed), 4:5 (retrato do Instagram), 9:16 (Stories, Reels e TikTok), 16:9 (YouTube e telas) e 4:3, como grupo de rádios com o uso de cada uma no rótulo
    - **Girar 90°** (sentido horário)
    - **Tamanho final:** largura e altura em px, com a proporção travada por padrão (botão de cadeado com `aria-pressed`). Começa com o tamanho do corte
    - **Saída:** mesmo formato da original (JPG e WebP com qualidade 0,92; PNG sem perdas, com a transparência). WebP no Safari com o codificador WASM da fase 10
  - **Processamento:** novas opções no `encodeImage` (`crop`, `rotate` e `resize`), dentro do Web Worker, com redução em etapas quando a imagem diminui muito (sem serrilhado)
  - **Funções puras (`src/lib/image/crop-geometry.ts`), com testes:** retângulo inicial de uma proporção (centralizado e o maior possível), limites do corte dentro da imagem, dimensões depois de girar, novo tamanho com a proporção travada, limites de saída (`image-limits.ts`)
  - **Nome de saída:** `foto-cortada.jpg` (sufixo `cortada`)
  - **Status `available`** no `tools.ts`: link no menu, sitemap, grade da home e ação "Cortar e redimensionar" do roteador
  - Atualizar o `CLAUDE.md` (etapa de edição, Cropper.js, opções de corte)
- **Não inclui:**
  - Espelhar, endireitar em ângulos livres, filtros e ajustes de cor
  - Corte em círculo (foto de perfil redonda): cabe numa evolução, com saída PNG
  - Várias imagens de uma vez (lote)
  - Trocar o formato na saída (é dos conversores)

## Decisões técnicas

| Decisão                                                           | Motivo                                                                                                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cropper.js 2.3.1** (MIT, ~15 KB gzip)                           | É a linha mantida (a 1.x virou `latest-1`). Vem como Web Components, com o estilo dentro do componente: não precisa de CSS global. A 1.7.0 (~14 KB + 1,3 KB de CSS) é a alternativa, se a 2.x der problema com o React 19 |
| **Carregado com `import()` ao escolher a imagem**                 | Quem só lê a página não baixa o editor. Segue a regra das bibliotecas sob demanda                                                                                                                                         |
| **O editor só mede; o corte acontece no worker**                  | O Cropper.js devolve o retângulo em pixels da imagem; o worker decodifica a original, corta, gira e redimensiona com `OffscreenCanvas`. A tela não trava com fotos grandes                                                |
| **Coordenadas já com a orientação do EXIF**                       | O `<img>` do editor e o `createImageBitmap(..., { imageOrientation: "from-image" })` do worker mostram a foto de pé. O retângulo vale igual nos dois                                                                      |
| **Etapa de edição no `useImageTool`** (`processOnSelect: false`)  | Reaproveita validação, URLs `blob:`, worker, erros e a passagem de arquivo da home, sem uma segunda máquina de estados                                                                                                    |
| **Mesmo formato na saída, JPG e WebP a 0,92**                     | Quem corta quer a mesma imagem, menor em área, e não uma imagem mais comprimida. Para reduzir KB, há o compactador (link no texto)                                                                                        |
| **Aumentar é permitido, com aviso**                               | Pedidos como "1080 × 1080" a partir de um corte menor são comuns. O aviso explica que aumentar não cria detalhes. Os limites de saída são os de entrada (16.384 px de lado, 16,7 milhões de pixels)                       |
| **Redução em etapas** (metade por vez até perto do tamanho final) | O `drawImage` direto de 4000 px para 400 px serrilha. Reduzir em etapas, com `imageSmoothingQuality: "high"`, mantém a nitidez sem biblioteca                                                                             |
| **Proporções com o uso no rótulo** ("4:5 · Retrato do Instagram") | A pessoa procura pela rede social, não pelo número. Ficam em `crop-presets.ts`, num lugar só                                                                                                                              |

## Tarefas

- [x] Conferir de novo o peso do `cropperjs` 2.3.1 e o funcionamento com React 19 (protótipo rápido)
- [x] Criar `crop-geometry.ts` e `crop-presets.ts`, com testes
- [x] Adicionar `crop`, `rotate` e `resize` ao `encodeImage` (com a redução em etapas)
- [x] Adicionar a etapa de edição ao `useImageTool` e o `editor` ao `ImageToolView`
- [x] Criar a ilha `ImageCropper` (editor, proporções, girar, tamanho final, avisos)
- [x] Criar a rota `/cortador-de-imagem` com textos, FAQ, metadados e JSON-LD
- [x] Trocar o status para `available`
- [x] Testes de componente e E2E (desktop e mobile, dev e produção)
- [x] Atualizar o `CLAUDE.md`
- [x] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(imagem): adiciona cálculos de corte, rotação e tamanho final`
2. `feat(imagem): corta, gira e redimensiona no worker`
3. `feat(ferramentas): adiciona etapa de edição antes de processar`
4. `feat(cortar): adiciona editor de corte com Cropper.js`
5. `feat(cortar): adiciona a página Cortar e redimensionar imagem`
6. `feat(ferramentas): libera Cortar imagem no registro`
7. `test(e2e): verifica o corte e o redimensionamento de ponta a ponta`
8. `docs: registra o cortador no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 12`

A instalação do `cropperjs` entra no commit 4. Os testes de unidade e de componente entram no mesmo commit do código.

## Testes

- **Vitest:**
  - `crop-geometry`: retângulo inicial de cada proporção (paisagem e retrato), corte sempre dentro da imagem, dimensões depois de 90°/180°/270°, tamanho final com proporção travada e destravada, limites de saída
  - `encodeImage`: `drawImage` com o retângulo de origem, rotação (canvas com lados trocados), redução em etapas (canvas simulado)
  - `useImageTool`: `processOnSelect: false` para em `editing`; `apply()` processa; `backToEditing()` mantém o arquivo; escolher outra imagem descarta o resultado
  - `ImageCropper` (Cropper.js simulado): proporções como rádios, cadeado com `aria-pressed`, campos de tamanho com nome acessível, aviso ao aumentar
- **Playwright (desktop e mobile, dev e produção):**
  - `foto.jpg` (480 × 320) em 1:1 → JPG de 320 × 320, nome `foto-cortada.jpg`
  - Tamanho final 100 × 100 → arquivo de 100 × 100
  - Girar 90° → largura e altura trocadas
  - `transparente.png` → PNG com o canto transparente
  - `foto-retrato-exif-6.jpg` → o corte respeita a foto de pé
  - Editor operável por teclado (setas movem a seleção) e por toque (mobile)
  - **Nenhuma requisição leva o arquivo**; o Cropper.js só carrega depois de escolher a imagem
  - Home: a ação "Cortar e redimensionar" vira link e leva a imagem até o editor
  - `<head>`, JSON-LD, sitemap, menu, 360px e axe nos dois temas (vazio, editando e com resultado); página no teste de CSP

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [x] `/cortador-de-imagem` corta, gira e redimensiona JPG, PNG e WebP no navegador, mantendo o formato e a orientação
- [x] Proporções das redes sociais e corte livre; tamanho final com proporção travada
- [x] Editor usável com mouse, toque e teclado, sem CLS
- [x] Cropper.js carregado só depois de escolher a imagem
- [x] Texto original, FAQ, metadados e JSON-LD; link no menu, na home e no sitemap
- [x] Nenhuma requisição leva o arquivo
- [x] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **Dependência nova: `cropperjs` 2.3.1** (MIT, ~15 KB gzip, sob demanda). Alternativa: a 1.7.0.
- **Lista de proporções:** Livre, 1:1, 4:5, 9:16, 16:9 e 4:3. Quer outras (ex.: 3:2 de foto, 1,91:1 de link do Facebook/LinkedIn, 3:4 de documento)?
- **Saída no mesmo formato, JPG e WebP a 0,92**, sem controle de qualidade nesta tela.
- **Aumentar a imagem é permitido** (com aviso). A alternativa é limitar ao tamanho do corte.
- **Girar entra; espelhar e corte redondo ficam fora.**

## Notas da implementação

**Desvios do plano**

- **Prévia reduzida no editor:** o editor não abre a original. Ele mostra uma prévia de até 1600 px, já de pé e girada, gerada pelo próprio worker (opção `fit` do `encodeImage`). Com isso, a imagem fica parada no editor (sem zoom nem arrastar a imagem): só a seleção se mexe, e a conversão para pixels da foto é uma regra de três. Fotos de 20 MB não pesam no celular.
- **Girar refaz a prévia,** em vez de girar a imagem dentro do Cropper.js (o corte é medido já no espaço girado, e o worker gira antes de cortar).
- **Teclado próprio:** o teclado nativo do Cropper.js escuta a página inteira e bloquearia a rolagem pelas setas. A área do editor é um grupo focável que trata as setas (mover) e Shift + setas (redimensionar pela borda direita ou de baixo).
- **Roda do mouse:** o canvas do Cropper.js cancela a rolagem da página (para dar zoom, que está desligado). O evento é interceptado antes dele, e a página rola normalmente.
- **`aria-hidden` no desenho do editor:** a grade do Cropper.js cria elementos com `role="row"` sem tabela (violação do axe). O leitor de tela recebe o grupo "Área de corte", com as instruções.
- **Seleção `precise` e bordas que grudam a 1,5 px de tela:** sem isso, o arredondamento do editor dava 319 × 319 em vez de 320 × 320 no celular.
- **Botão "Cortar imagem" abaixo do editor,** e não com as outras opções: no celular, ele fica logo depois de ajustar o corte, sem rolar a página de volta.
- **Tamanho final ao mexer no corte:** com a proporção travada e um tamanho digitado, a largura fica e a altura acompanha o novo corte. Trocar a proporção ou girar volta ao tamanho do corte.
- **PNG pelo canvas** (sem perdas), sem o oxipng: o corte precisa ser rápido. O link para o compactador aparece no resultado.
- **Testes da home:** com Converter, Compactar e Cortar prontos, todas as ações de PNG são links. O caso "Em breve" segue coberto pelo HEIC.

**Conferido no build de produção:** `/cortador-de-imagem` é estática; o Cropper.js (~14,7 KB gzip) não está no HTML e só carrega pelo `import()` ao escolher a imagem. A página carrega só a ilha (~5 KB gzip).

**Testes:** 313 de unidade e componente; E2E com 257 testes em dev (os do cortador estáveis em 2 repetições, desktop e mobile) e 187 no build de produção.

**Pendências**

- Lighthouse mobile não medido (fica para a fase de auditoria).
- Toque real no celular não testado em aparelho (o Playwright mobile emula o Pixel 7). Entra no roteiro da auditoria.
- Espelhar e corte redondo continuam fora, como previsto.
