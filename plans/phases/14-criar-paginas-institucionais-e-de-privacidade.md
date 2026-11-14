# 14 — Criar páginas institucionais e de privacidade

**Status:** 📝 Rascunho · **Branch:** `feat/14-criar-paginas-institucionais-e-de-privacidade` · **Depende de:** 07 e 08

## Objetivo

Criar as quatro páginas que o Google AdSense exige para aprovar o site, e o **footer** que liga todas elas: **Sobre**, **Contato**, **Política de Privacidade** e **Termos de Uso**.

Além de exigência do AdSense, elas dizem com clareza o que já é verdade no código: os arquivos não saem do aparelho. Também deixam a política pronta para os cookies de anúncio, que chegam na fase do AdSense.

## Referência visual

Texto longo em `max-w-prose`, no estilo das seções de texto das ferramentas:

```
   Política de Privacidade (h1)
   Última atualização: 14 de novembro de 2026

   Resumo em 3 itens (caixa destacada)
   • Suas imagens nunca saem do seu aparelho
   • Não pedimos cadastro nem guardamos dados pessoais
   • Os anúncios do Google podem usar cookies

   ## Suas imagens
   ...
   ─────────────────────────────────────────────
   Footer: Tools Fácil · Sobre · Contato · Privacidade · Termos · Ferramentas
```

Sem print em `referencias/projeto/`: se você mandar um do footer, ele substitui este desenho.

## Escopo

- **Inclui:**
  - **Rotas** em `src/app/(institutional)/`: `/sobre`, `/contato`, `/politica-de-privacidade` e `/termos-de-uso`, cada uma com `createPageMetadata` (title, description e canonical)
  - **Componente `ProsePage`** (`src/components/layout/`): `h1`, data da última atualização (quando houver), resumo opcional e o texto com `h2`/`h3` e listas no estilo do site
  - **`SiteFooter`** no layout raiz, em todas as páginas: nome do site, links institucionais e as ferramentas prontas (do `tools.ts`). Fica depois do `<main>`, com `<footer>` e uma `<nav aria-label="Rodapé">`
  - **Textos:**
    - **Sobre:** o que é o site, os três princípios (rápido, privado, grátis), como o site se mantém (anúncios) e os **créditos e licenças** das bibliotecas (`@jsquash/webp`, `@jsquash/oxipng`, Cropper.js e o decodificador de HEIC, conforme a fase 13)
    - **Contato:** só o e-mail (link `mailto:`), vindo do `site-config.ts`, sem formulário
    - **Política de Privacidade:** processamento local dos arquivos, ausência de cadastro e de banco de dados, registros técnicos da hospedagem (IP e navegador), cookies e anúncios do Google AdSense (com o link para as configurações de anúncios do Google), direitos do titular pela LGPD, contato e atualizações da política
    - **Termos de Uso:** uso gratuito, responsabilidade pelos direitos das imagens, ferramentas "no estado em que se encontram", limitação de responsabilidade, anúncios, mudanças nos termos e lei brasileira
  - **`site-pages.ts`**: as quatro páginas entram no sitemap
  - **`site-config.ts`**: novos campos `contactEmail` e `legalUpdatedAt` (data das políticas)
  - **404:** já lista home e ferramentas; o footer completa a navegação
  - Atualizar o `CLAUDE.md` (footer, `ProsePage`, onde ficam os textos legais)
- **Não inclui:**
  - Banner de consentimento de cookies e a CMP (fase do AdSense)
  - Formulário de contato (exigiria servidor ou serviço externo)
  - Versão em outros idiomas
  - Revisão jurídica: os textos são um ponto de partida claro e honesto, não um parecer de advogado

## Decisões técnicas

| Decisão                                          | Motivo                                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Política já menciona o AdSense e os cookies**  | O AdSense pede a política publicada antes da análise. Escrever agora evita publicar uma política que fica errada assim que os anúncios entram |
| **Texto escrito para leigo, com resumo no topo** | O público são usuários comuns. Resumo em três itens e linguagem direta, sem jargão jurídico desnecessário                                     |
| **Textos em `content.ts` de cada rota**          | Mesmo padrão das ferramentas: o `page.tsx` monta, o `content.ts` guarda o texto. A data da última atualização fica num lugar só               |
| **Footer com as ferramentas do registro**        | Mais links internos ajudam o SEO e a navegação no celular. A lista vem de `getAvailableTools()`, nunca de uma lista solta                     |
| **Sem JSON-LD nessas páginas**                   | Não há dado estruturado útil a mais. As regras do projeto proíbem inventar avaliações ou números                                              |
| **E-mail visível, sem ofuscação por script**     | A CSP e a simplicidade pedem HTML puro. Se o spam incomodar, a troca do endereço é só no `site-config.ts`                                     |

## Tarefas

- [ ] Confirmar com você o e-mail de contato e o nome do responsável pelo site (ver "Pontos para a revisão")
- [ ] Criar `ProsePage` e `SiteFooter`, com testes, e incluir os dois no `/styleguide`
- [ ] Colocar o footer no layout raiz
- [ ] Escrever e publicar Sobre, Contato, Política de Privacidade e Termos de Uso
- [ ] Atualizar `site-pages.ts` e `site-config.ts`
- [ ] Testes E2E das páginas e do footer
- [ ] Atualizar o `CLAUDE.md`
- [ ] Preencher as notas desta fase, atualizar o `index.md` e abrir o PR

## Commits previstos

1. `feat(layout): adiciona footer com páginas institucionais e ferramentas`
2. `feat(layout): adiciona molde de página de texto longo`
3. `feat(institucional): adiciona as páginas Sobre e Contato`
4. `feat(institucional): adiciona a Política de Privacidade`
5. `feat(institucional): adiciona os Termos de Uso`
6. `feat(seo): inclui as páginas institucionais no sitemap`
7. `test(e2e): verifica as páginas institucionais e o footer`
8. `docs: registra as páginas institucionais no CLAUDE.md`
9. `docs(plans): registra notas da implementação da fase 14`

## Testes

- **Vitest:** `SiteFooter` (links institucionais e só as ferramentas prontas), `ProsePage` (um `h1`, data formatada em pt-BR), sitemap com as quatro páginas, `site-config` com e-mail válido
- **Playwright (desktop e mobile, dev e produção):**
  - Cada página: `h1`, title com o sufixo do site, description, canonical, 360px sem rolagem horizontal e axe nos dois temas
  - Footer presente em todas as páginas (home, ferramenta, institucional e 404), com os links funcionando
  - Contato: link `mailto:` com o e-mail do `site-config.ts`
  - Páginas no teste de CSP

## Variáveis de ambiente novas

| Nome | Finalidade | Onde obter |
| ---- | ---------- | ---------- |
| —    | —          | —          |

## Critérios de aceite

- [ ] As quatro páginas publicadas, com texto original, claro e coerente com o que o site faz
- [ ] Política de Privacidade cobre o processamento local, a hospedagem, os cookies do AdSense e a LGPD
- [ ] Footer em todas as páginas, com links institucionais e ferramentas prontas
- [ ] Páginas no sitemap, com metadados e canonical
- [ ] `lint`, `format:check`, `typecheck`, `test`, `test:e2e` e `build` passando

## Pontos para a revisão do usuário

- **E-mail de contato:** qual endereço usar? Ele fica público no site. Sugestão: um e-mail só do site (ex.: `contato@toolsfacil.com.br` depois do domínio, ou um Gmail novo até lá), e não o pessoal.
- **Responsável pelo site:** a LGPD pede que a política diga quem é o controlador dos dados. Pode ser seu nome (pessoa física) ou um CNPJ/MEI, se houver. Quer que apareça só o nome do site e o e-mail?
- **Revisão jurídica:** recomendo que um advogado leia a política e os termos antes do lançamento, principalmente se o site crescer ou ganhar o Pix.
- **Footer com as ferramentas:** além das páginas institucionais. A alternativa é um footer mínimo, só com os links institucionais.

## Notas da implementação

_Preenchido ao final: desvios do plano, pendências e aprendizados._
