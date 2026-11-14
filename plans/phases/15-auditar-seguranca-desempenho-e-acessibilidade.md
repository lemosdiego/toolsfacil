# 15 — Auditar segurança, desempenho e acessibilidade

**Status:** 📝 Rascunho · **Branch:** `chore/15-auditar-seguranca-desempenho-e-acessibilidade` · **Depende de:** 12, 13 e 14

## Objetivo

Antes de publicar, conferir o site inteiro contra as metas do projeto e corrigir o que faltar:

- **Desempenho:** Lighthouse mobile **≥ 90** em todas as páginas de ferramenta e na home (pendência das fases 10 e 11), com Core Web Vitals bons e bundles enxutos.
- **Segurança:** CSP e cabeçalhos, dependências sem vulnerabilidades conhecidas e a regra de ouro (nenhum byte do arquivo sai do navegador) conferida de novo.
- **Acessibilidade:** além do axe automático, revisão manual com teclado, leitor de tela, zoom e celular de verdade.

A fase entrega um **relatório** (nas notas da fase) e as **correções pequenas**. Um problema grande vira uma fase nova no roteiro, em vez de inchar esta.

## Escopo

- **Inclui:**
  - **Desempenho:**
    - Lighthouse mobile (3 rodadas, mediana) contra o build de produção em `/`, em cada ferramenta e numa página institucional
    - Análise dos bundles: JS de primeiro carregamento por rota e confirmação de que Cropper.js, oxipng, codificador WebP e decodificador de HEIC só carregam sob demanda
    - CLS dos espaços de anúncio (alturas reservadas) e da fonte; LCP do `h1` no celular
    - Medição do tempo de processamento de uma foto de 12 MP num celular intermediário (Android) e no iPhone
  - **Segurança:**
    - `pnpm audit` e revisão das licenças das dependências de produção
    - Revisão da CSP e dos cabeçalhos em produção (conferência com o observatório da Mozilla ou equivalente)
    - Revisão do código com a skill `security-review`: uso de `dangerouslySetInnerHTML`, URLs `blob:` revogadas, telas de erro sem registrar dados, nenhum `fetch` com arquivo ou nome de arquivo
    - Confirmar que o teste "nenhuma requisição leva o arquivo" existe para todas as ferramentas
  - **Acessibilidade:**
    - Roteiro manual com só o teclado em todas as telas (menu, seletor de arquivo, editor de corte, download)
    - Leitor de tela: NVDA ou Orca no desktop, VoiceOver no iPhone e TalkBack no Android, nas ferramentas
    - Zoom de 200% e texto ampliado, `prefers-reduced-motion`, alvos de toque de 44 px, foco visível nos dois temas
  - **Teste em aparelhos reais:** Safari no iPhone (WebP pelo WASM e HEIC nativo, que o CI não cobre) e um Android intermediário
  - **Lighthouse automatizado (opcional, ver "Pontos para a revisão"):** um script `pnpm lighthouse` que roda contra o `pnpm start` e falha abaixo de 90
  - Correções pequenas encontradas, cada uma no seu commit
  - Atualizar o `CLAUDE.md` com o que mudar nas regras (ex.: orçamento de JS por rota)
- **Não inclui:**
  - Mudanças de identidade visual (fase própria; o contraste é conferido de novo pelo axe nela)
  - Teste de invasão profissional
  - Correções grandes: viram itens do roteiro

## Decisões técnicas

| Decisão                                   | Motivo                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Medir no build de produção, em mobile** | O `next dev` não representa o site publicado. O Lighthouse mobile simula um celular intermediário com rede lenta, o caso real do público          |
| **Mediana de 3 rodadas**                  | Uma rodada só do Lighthouse varia vários pontos. A mediana evita corrigir ruído                                                                   |
| **Relatório nas notas da fase**           | Fica junto do plano e do PR, sem documento solto. Problemas maiores entram no `index.md` como fases novas                                         |
| **Roteiro manual de acessibilidade**      | O axe pega cerca de um terço dos problemas. Teclado e leitor de tela de verdade pegam o resto (ordem de foco, anúncios de estado, nomes confusos) |
| **Aparelhos reais antes de publicar**     | O Safari tem caminhos próprios (WebP pelo WASM e HEIC nativo) que só uma simulação cobre no CI                                                    |

## Tarefas

- [ ] Rodar o Lighthouse mobile em todas as páginas (build de produção) e registrar as notas
- [ ] Analisar os bundles e confirmar o carregamento sob demanda
- [ ] `pnpm audit`, licenças e revisão de segurança do código
- [ ] Conferir a CSP e os cabeçalhos com uma ferramenta externa (depois da publicação, se precisar da URL pública)
- [ ] Roteiro manual de teclado, leitor de tela, zoom e movimento reduzido
- [ ] Testar em iPhone e Android reais (com a sua ajuda, ver "Pontos para a revisão")
- [ ] Corrigir os problemas pequenos e listar os grandes no roteiro
- [ ] (Opcional) criar o `pnpm lighthouse`
- [ ] Preencher o relatório nas notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

Os commits de correção dependem do que a auditoria encontrar. Um por problema, no formato `fix(escopo): ...` ou `perf(escopo): ...`. Previstos:

1. `chore(qualidade): adiciona medição do Lighthouse` (se aprovada)
2. `fix(...)` / `perf(...)` para cada correção
3. `docs: registra as metas de desempenho no CLAUDE.md` (se as regras mudarem)
4. `docs(plans): registra o relatório da auditoria da fase 15`

## Testes

- Os testes atuais continuam passando depois de cada correção
- Cada correção de comportamento ganha um teste que falharia antes (Vitest ou Playwright)
- Se o `pnpm lighthouse` for aprovado: ele mesmo é o teste da meta de 90

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [ ] Lighthouse mobile ≥ 90 (desempenho) e 100 (acessibilidade, boas práticas e SEO, ou a justificativa) em todas as páginas de ferramenta e na home
- [ ] Nenhuma vulnerabilidade alta ou crítica no `pnpm audit` das dependências de produção
- [ ] Bibliotecas pesadas confirmadas como sob demanda
- [ ] Roteiro manual de acessibilidade feito, com os problemas corrigidos ou listados
- [ ] Relatório nas notas da fase, com o que ficou para depois no roteiro

## Pontos para a revisão do usuário

- **Permissão para o Lighthouse:** nas fases 10 e 11, o comando foi bloqueado pelas permissões da sessão. Para esta fase, preciso que você libere o `pnpm dlx lighthouse` (ou rode e me passe os relatórios).
- **`pnpm lighthouse` automatizado:** adiciona o `lighthouse` como dependência de desenvolvimento (só local, fora do bundle). Quer também no CI? Deixa o CI uns 2 minutos mais lento.
- **Aparelhos reais:** preciso de você num iPhone (Safari) e num Android para o roteiro de teste. Mando a lista de passos.
- **Ordem com a identidade visual:** a auditoria vem antes da identidade, como no roteiro. O contraste das cores novas é conferido pelo axe na própria fase da identidade. Se preferir, trocamos a ordem e auditamos já com as cores finais.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
