# 18 — Integrar AdSense com consentimento de cookies

**Status:** 📝 Rascunho · **Branch:** `feat/18-integrar-adsense-com-consentimento-de-cookies` · **Depende de:** 17 e da aprovação do site no AdSense

## Objetivo

Ligar a única fonte de receita do MVP: os **anúncios do Google AdSense** nos espaços que o `ToolPageLayout` já reserva desde a fase 05, com o **consentimento de cookies** exigido pelo Google para visitantes do Espaço Econômico Europeu, do Reino Unido e da Suíça.

Tudo isso sem quebrar o que já foi conquistado: nada de CLS, nenhum anúncio perto do botão de download ou da área de soltar arquivo, CSP restrita (só com os domínios do Google) e Lighthouse mobile ≥ 90.

## Pré-requisito: aprovação do AdSense

O código só faz sentido depois que o Google aprovar o site. O caminho, feito por você:

1. Site publicado (fase 17), com as páginas institucionais (fase 14) e conteúdo original em cada ferramenta
2. Cadastro no AdSense com o domínio e a verificação (o Google dá um código ou o `ads.txt` para provar que o site é seu)
3. Análise do Google (de alguns dias a algumas semanas)

Para a verificação, a fase pode entrar em duas partes: primeiro o `ads.txt` e o script de verificação (pequeno PR), depois os anúncios, quando a aprovação sair.

## Escopo

- **Inclui:**
  - **`ads.txt` gerado no build** (`src/app/ads.txt/route.ts`, estático) a partir da `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: a linha do Google sai certa sem você editar arquivo. Sem a variável, responde 404
  - **Script do AdSense** no layout raiz com `next/script` e `strategy="afterInteractive"`, só quando a variável existe
  - **`AdSlot` de verdade:** renderiza o `<ins class="adsbygoogle">` com o ID do bloco da posição e chama o `adsbygoogle.push()` numa ilha `"use client"`, mantendo a altura reservada e o rótulo "Publicidade"
  - **Blocos de anúncio manuais**, um por posição (`top`, `below-tool`, `in-content`, `sidebar`), com os IDs em variáveis de ambiente
  - **Anúncios automáticos desligados** (configuração do painel, feita por você)
  - **Consentimento (CMP):** mensagem de privacidade do próprio Google (**Privacidade e mensagens**, no painel do AdSense), que é certificada pelo Google e carrega pelo mesmo script
  - **Link "Preferências de privacidade" no footer**, que reabre a mensagem de consentimento
  - **CSP:** domínios do AdSense e da CMP em `script-src`, `img-src`, `frame-src` e `connect-src`, só em produção com a variável preenchida
  - **Política de Privacidade** atualizada: CMP, como mudar o consentimento e o link para as configurações de anúncios do Google
  - **Alturas reservadas** conferidas com os tamanhos realmente servidos (o comentário do `AdSlot` cita a fase pelo número antigo e será corrigido)
  - Atualizar o `CLAUDE.md` (AdSense ativo, `ads.txt` gerado, CMP escolhida, ponto em aberto resolvido)
- **Não inclui:**
  - Anúncios automáticos (Auto ads), âncora no rodapé do celular ou vinhetas (interstitials): colocam anúncios onde o projeto proíbe
  - Outras redes de anúncio
  - Analytics próprio

## Decisões técnicas

| Decisão                                             | Motivo                                                                                                                                                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Só blocos manuais, Auto ads desligado**           | Os anúncios automáticos podem aparecer colados ao botão de download ou à área de soltar arquivo, o que as regras do projeto proíbem (clique acidental pode suspender a conta)                                                                                      |
| **CMP do próprio Google (Privacidade e mensagens)** | É grátis, certificada pelo Google para o EEE e o Reino Unido, configurada no painel e carregada pelo mesmo script do AdSense: nenhum serviço externo novo. Alternativas pagas (Cookiebot, CookieYes) só fariam sentido com outros rastreadores, que o site não tem |
| **`ads.txt` gerado a partir da variável**           | Evita um arquivo editado à mão que pode ficar diferente do ID usado nos anúncios. Muda o texto atual do `CLAUDE.md` ("preenchida pelo usuário"), que será atualizado                                                                                               |
| **IDs dos blocos em variáveis `NEXT_PUBLIC_*`**     | Mesmo padrão do ID do publisher: nada de valor real no repositório, e o build de teste continua sem anúncios                                                                                                                                                       |
| **Domínios do Google na CSP só com a variável**     | Em dev e no CI (sem a variável), a CSP continua igual e restrita. Um teste de unidade cobre a política com os anúncios ligados                                                                                                                                     |
| **Validação da CSP em produção**                    | O Google não publica uma lista fechada de domínios. O E2E bloqueia as chamadas reais (não dá para depender da rede do Google no CI); a conferência final é no site publicado, pelo console do navegador, com a lista de violações nas notas da fase                |

## Tarefas

- [ ] Você cadastra o site no AdSense e cria os 4 blocos de anúncio manuais (eu passo os formatos)
- [ ] Gerar o `ads.txt` e colocar o script com a variável (PR curto, se a verificação precisar antes)
- [ ] Ligar o `AdSlot` aos blocos, com a ilha que chama o `adsbygoogle.push()`
- [ ] Liberar os domínios do AdSense e da CMP na CSP (com testes)
- [ ] Você configura a mensagem de consentimento (EEE, Reino Unido e Suíça) no painel; eu adiciono o link "Preferências de privacidade" no footer
- [ ] Atualizar a Política de Privacidade
- [ ] Conferir as alturas reservadas e o CLS com anúncios reais (Lighthouse e uso no celular)
- [ ] Conferir no ar: anúncios carregando, CSP sem violações, nenhum anúncio perto da ferramenta
- [ ] Atualizar o `CLAUDE.md` e o `.env.example`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(anuncios): gera o ads.txt a partir do ID do publisher`
2. `feat(anuncios): carrega o script do AdSense quando configurado`
3. `feat(anuncios): exibe os blocos do AdSense nos espaços reservados`
4. `feat(seguranca): libera os domínios do AdSense na CSP em produção`
5. `feat(privacidade): adiciona link para as preferências de consentimento`
6. `docs(privacidade): atualiza a política com os anúncios e a CMP`
7. `test(e2e): verifica o carregamento dos anúncios sem afetar a ferramenta`
8. `docs: registra o AdSense e a CMP no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 18`

## Testes

- **Vitest:**
  - `ads.txt`: linha `google.com, pub-..., DIRECT, f08c47fec0942fa0` com a variável; 404 sem ela
  - `AdSlot`: sem variável, nada em produção e contorno em dev (como hoje); com variável, `<ins>` com o cliente e o bloco certos, altura reservada e rótulo "Publicidade"
  - `buildContentSecurityPolicy`: domínios do Google só com os anúncios ligados
  - Footer: link de preferências só com os anúncios ligados
- **Playwright** (com IDs falsos e as chamadas ao Google interceptadas, sem rede externa):
  - O script do AdSense é pedido só depois da página interativa, e nenhuma requisição leva o arquivo da pessoa
  - Distância mínima de 48 px entre cada anúncio e a área de escolher/baixar, no desktop e no celular
  - Sem CLS: a altura do espaço não muda quando o anúncio (simulado) chega
  - O teste de CSP continua sem violações
- **Manual (no ar):** anúncios carregando nas 4 posições, mensagem de consentimento aparecendo para um visitante do EEE (com VPN), CSP sem violações no console, Lighthouse mobile ≥ 90 com anúncios

## Variáveis de ambiente novas

| Nome                                  | Finalidade                              | Onde obter                                           |
| ------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP`        | ID do bloco de anúncio da posição `top` | Painel do AdSense → Anúncios → Por bloco de anúncios |
| `NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TOOL` | ID do bloco da posição `below-tool`     | Idem                                                 |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | ID do bloco da posição `in-content`     | Idem                                                 |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`    | ID do bloco da posição `sidebar`        | Idem                                                 |

> A `NEXT_PUBLIC_ADSENSE_CLIENT_ID` já existe no `.env.example`. Os valores são preenchidos por você no painel da hospedagem. Sem um ID de bloco, aquela posição fica sem anúncio.

## Critérios de aceite

- [ ] Anúncios do AdSense nas quatro posições reservadas, só com as variáveis preenchidas
- [ ] Nenhum anúncio perto do botão de download ou da área de soltar arquivo; sem Auto ads
- [ ] Mensagem de consentimento certificada para EEE, Reino Unido e Suíça, com o link para mudar a escolha no footer
- [ ] `ads.txt` correto em `/ads.txt`
- [ ] CSP restrita, com só os domínios necessários e sem violações no ar
- [ ] Sem CLS dos anúncios; Lighthouse mobile ≥ 90 mantido
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **CMP do Google (Privacidade e mensagens)** em vez de uma solução paga. Ela cobre a exigência do Google para EEE, Reino Unido e Suíça.
- **Visitantes do Brasil:** a LGPD não obriga um banner de cookies para anúncios do mesmo jeito que a lei europeia, mas pede transparência (coberta pela Política de Privacidade). Quer também uma mensagem de consentimento para o Brasil? Pode reduzir um pouco a receita, porque parte das pessoas recusa.
- **`ads.txt` gerado pelo build**, em vez do arquivo em `public/` editado por você (muda uma linha do `CLAUDE.md`).
- **Quatro blocos de anúncio:** se preferir menos anúncios no começo (ex.: só `below-tool` e `in-content`), basta não preencher as outras variáveis.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
