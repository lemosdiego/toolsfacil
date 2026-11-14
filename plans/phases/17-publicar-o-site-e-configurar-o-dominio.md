# 17 — Publicar o site e configurar o domínio

**Status:** 📝 Rascunho · **Branch:** `chore/17-publicar-o-site-e-configurar-o-dominio` · **Depende de:** 15 e 16

## Objetivo

Colocar o Tools Fácil no ar, no domínio próprio, com HTTPS, os cabeçalhos de segurança e o deploy automático a cada merge na `main`. Depois, cadastrar o site no Google Search Console para começar a receber tráfego orgânico.

O site publicado, com as ferramentas e as páginas institucionais, é o pré-requisito para pedir a aprovação do AdSense, na fase seguinte.

Esta fase **toca produção** (contas, domínio, DNS e painel de hospedagem). As ações nessas contas são suas. Eu preparo o código, os arquivos de configuração e o passo a passo, e só sigo cada etapa com a sua confirmação.

## Escopo

- **Inclui:**
  - **Decisão da hospedagem** (ponto em aberto do `CLAUDE.md`), a partir de um protótipo (ver "Decisões técnicas")
  - **Configuração do projeto** para a hospedagem escolhida: build, variáveis de ambiente e cabeçalhos de segurança aplicados também em produção
  - **Domínio** `toolsfacil.com.br` registrado no Registro.br (por você), com o DNS apontando para a hospedagem, HTTPS e o redirecionamento 301 de `www` para o domínio sem `www` (ou o contrário, ver "Pontos para a revisão")
  - **Ambientes de prévia** (deploy de cada PR) com `X-Robots-Tag: noindex`, para o Google não indexar URLs de teste
  - **`NEXT_PUBLIC_SITE_URL`** com a URL final no painel da hospedagem (por você)
  - **Verificação pós-deploy:** os E2E rodando contra a URL pública (só leitura: páginas, cabeçalhos, sitemap, robots), com `PLAYWRIGHT_BASE_URL`
  - **Google Search Console:** verificação do domínio por registro TXT no DNS e envio do `sitemap.xml`
  - **README** com a seção "Publicação": onde está hospedado, como funciona o deploy e como reverter
  - Atualizar o `CLAUDE.md` (hospedagem e domínio resolvidos, comandos de deploy)
- **Não inclui:**
  - AdSense, `ads.txt` e consentimento de cookies (fase seguinte)
  - Analytics (se você quiser, entra num plano próprio, sem dados pessoais)
  - E-mail no domínio (ex.: `contato@toolsfacil.com.br`): fica como passo opcional no README, configurado por você no provedor que escolher

## Decisões técnicas

| Decisão                                                   | Motivo                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Duas opções de hospedagem, decididas por um protótipo** | O plano Hobby da Vercel não permite uso comercial, e o site terá anúncios. Ficam duas opções reais (abaixo). O protótipo mostra se a opção gratuita funciona sem perder nada do que o site já faz                                                                                                                                                                                        |
| **Opção A: Vercel Pro**                                   | Zero mudança de código: o Next roda como hoje, com os cabeçalhos do `next.config.ts`. Custo mensal por membro (conferir o preço atual no momento da decisão)                                                                                                                                                                                                                             |
| **Opção B: Cloudflare (site estático)**                   | Hoje todas as páginas saem estáticas no build (○). Com `output: "export"`, o site vira arquivos estáticos servidos de graça, com uso comercial permitido. Os cabeçalhos do `next.config.ts` não valem num site estático: um script do build gera o arquivo `_headers` a partir do mesmo `security-headers.ts` (uma fonte só). Webhooks do Pix, no futuro, rodariam em Cloudflare Workers |
| **Protótipo da opção B primeiro**                         | O `cacheComponents` e o `partialPrefetching` ligados no `next.config.ts` podem não combinar com o `output: "export"`. Se o build estático exigir desligá-los sem perda real (o site não usa dados dinâmicos), a opção B fica de pé; se exigir mais que isso, a recomendação passa para a A                                                                                               |
| **Cabeçalhos conferidos no ar**                           | O teste E2E de cabeçalhos roda também contra a URL pública: CSP, HSTS e os demais precisam chegar iguais aos de hoje                                                                                                                                                                                                                                                                     |
| **Prévias com `noindex`**                                 | Sem isso, URLs de PR podem aparecer no Google como conteúdo duplicado                                                                                                                                                                                                                                                                                                                    |
| **Deploy pela integração Git da hospedagem**              | Merge na `main` publica sozinho, e cada PR ganha uma prévia. O CI do GitHub continua sendo o portão: lint, testes e build passam antes do merge                                                                                                                                                                                                                                          |

## Tarefas

- [ ] Protótipo da opção B (build estático + `_headers` gerado) e comparação com a opção A
- [ ] Você decide a hospedagem (com o protótipo e o custo atual de cada opção)
- [ ] Ajustar o projeto para a hospedagem escolhida (com testes do que for gerado, como o `_headers`)
- [ ] Você cria a conta e o projeto na hospedagem, ligado ao repositório, e preenche a `NEXT_PUBLIC_SITE_URL`
- [ ] Você registra o domínio no Registro.br; eu passo os registros de DNS
- [ ] Conferir HTTPS, redirecionamento do `www` e `noindex` nas prévias
- [ ] Rodar os E2E de leitura contra a URL pública
- [ ] Você verifica o domínio no Search Console; envio do sitemap
- [ ] Escrever a seção "Publicação" no README e atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

Dependem da hospedagem escolhida. Previstos para a opção B:

1. `chore(deploy): gera o site estático para a hospedagem`
2. `feat(seguranca): gera o arquivo _headers a partir da política de segurança`
3. `chore(seo): marca as prévias de deploy como noindex`
4. `test(e2e): permite rodar os testes de leitura contra a URL pública`
5. `docs: documenta a publicação no README e no CLAUDE.md`
6. `docs(plans): registra notas da implementação da fase 17`

Na opção A, os commits 1 e 2 dão lugar a um `chore(deploy): configura o projeto na Vercel`, se for preciso algum ajuste.

## Testes

- **Vitest:** gerador do `_headers` (opção B): mesmos cabeçalhos do `security-headers.ts`, para todas as rotas; regra de `noindex` só nas prévias
- **Playwright:** os specs de leitura (`seo`, `security-headers`, `error-pages`, páginas das ferramentas sem escolher arquivo) rodando com `PLAYWRIGHT_BASE_URL` apontando para a URL pública. Os specs que processam imagem também podem rodar lá, porque nada é enviado
- **Manual:** HTTPS válido, `www` → domínio em 301, `http` → `https`, prévia com `noindex`, sitemap e robots com a URL final

## Variáveis de ambiente novas

| Nome                  | Finalidade                                                                          | Onde obter                                                      |
| --------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `PLAYWRIGHT_BASE_URL` | Opcional: roda os E2E contra uma URL já publicada, em vez de subir o servidor local | Você define na hora de rodar (ex.: `https://toolsfacil.com.br`) |

> A `NEXT_PUBLIC_SITE_URL` já existe: nesta fase ela recebe a URL final no painel da hospedagem.

## Critérios de aceite

- [ ] Site no ar em `https://toolsfacil.com.br`, com deploy automático a cada merge na `main`
- [ ] Cabeçalhos de segurança e CSP iguais aos de desenvolvimento (testados contra a URL pública)
- [ ] `www` e `http` redirecionam com 301; prévias com `noindex`
- [ ] Sitemap e canonical com a URL final; domínio verificado no Search Console, com o sitemap enviado
- [ ] README com o processo de publicação e de reversão

## Pontos para a revisão do usuário

- **Hospedagem:** Vercel Pro (pago, sem mudança de código) ou Cloudflare como site estático (grátis para uso comercial, com o arquivo `_headers` gerado). Recomendo decidir depois do protótipo. Pela regra de custo zero do projeto, prefiro a Cloudflare se o protótipo passar.
- **Domínio:** `toolsfacil.com.br` estava livre em 10/11/2026. O registro (cerca de R$ 40 por ano no Registro.br) é feito por você, com o seu CPF ou CNPJ.
- **Com ou sem `www`:** recomendo o domínio sem `www` como principal (mais curto), com o `www` redirecionando.
- **Search Console:** a conta Google usada fica dona do site no Search Console. Use a mesma conta que vai usar no AdSense.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
