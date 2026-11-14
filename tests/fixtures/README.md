# Fixtures de teste

Imagens usadas pelos testes E2E (Playwright) para validar o processamento real no navegador: conversão, corte e compactação.

## Como são feitas

Todas são geradas pelo script [`scripts/generate-fixtures.mjs`](../../scripts/generate-fixtures.mjs), com o Chromium do Playwright (sem ImageMagick nem exiftool). Para recriar:

```bash
pnpm fixtures:generate
```

São desenhadas pelo script: **sem dados pessoais** e sem EXIF, a não ser a orientação gravada de propósito no JPG de retrato.

## Arquivos

| Arquivo                   | Caso de teste                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `transparente.png`        | PNG 320 × 240 com fundo transparente (o canto superior esquerdo é totalmente transparente)             |
| `foto.jpg`                | JPG comum, 480 × 320                                                                                   |
| `foto-retrato-exif-6.jpg` | JPG gravado em 400 × 300 com EXIF de orientação 6: aparece de pé (300 × 400) e deve sair de pé         |
| `foto-detalhada.jpg`      | JPG 720 × 540 com textura e ruído, em qualidade alta (~190 KB): a compactação reduz de verdade         |
| `imagem.webp`             | WebP 200 × 200                                                                                         |
| `grande-demais.png`       | PNG 5000 × 4000 (20 milhões de pixels, acima do limite), em tons de cinza para o arquivo ficar pequeno |
| `falso.png`               | Texto com extensão `.png`: deve ser recusado pelo tipo real                                            |

## Regras

- Arquivos pequenos (até 200 KB), para o repositório e o CI continuarem rápidos.
- Só imagens geradas pelo script ou livres de direitos, sem dados pessoais (confira o EXIF, principalmente GPS).
- O nome do arquivo descreve o caso de teste. Imagem nova entra no script e nesta tabela.
- HEIC entra na fase do conversor de HEIC (o Chromium não gera HEIC).
