# Referências

Design system, estudos de apoio e material auxiliar.

## Documentos

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| [01-DESIGN-REFERENCE.md](01-DESIGN-REFERENCE.md) | Design system da Piaro, adaptador do Cifra Club. Cores, tipografia, espaçamento, componentes e guia de aplicação. | ✅ Completo |
| [ESTUDO-STACK.md](ESTUDO-STACK.md) | Racionalização completa das escolhas de tecnologia (material de estudo, não especificação) | ✅ Completo |
| [PLANO-ORGANIZACAO-DOC.md](PLANO-ORGANIZACAO-DOC.md) | Plano que orientou a organização da documentação (executado). Contém o template dos documentos de módulo. | ✅ Executado |
| [btn-diagnostico.html](btn-diagnostico.html) | Página descartável de comparação visual dos botões. Não faz parte do app. | 🔧 Descartável |
| [GLOSSARIO.md](GLOSSARIO.md) | Termos técnicos do domínio | 🔴 Pendente |
| [ABREVIACOES.md](ABREVIACOES.md) | Siglas e abreviações | 🔴 Pendente |
| [EXTERNAL.md](EXTERNAL.md) | Links úteis externos | 🔴 Pendente |

## 01 - Design Reference

O design da Piaro foi construído a partir da análise do design system do
[Cifra Club](https://www.cifraclub.com.br) — site de cifras e tablaturas com
estrutura de catálogo densa e escura.

**Decisões-chave:**

- **Dark-only.** A Piaro não terá tema light. Todos os tokens vivem em um único `:root` no `globals.css`; introduzir light futuramente significa mover valores para um seletor `[data-theme="light"]`, sem tocar em componentes.
- **Paleta preservada do Cifra Club.** Âmbar `#b77d36` como cor de ação, neutros de `#000000` a `#f1f1f1`.
- **Camada shadcn/ui preservada.** As variáveis `--background`, `--foreground`, `--card`, `--primary` etc. mantêm os nomes que o shadcn espera; apenas os valores mudaram. Componentes shadcn funcionam sem adaptação.
- **Tokens próprios acrescentados.** `--header`, `--footer`, estados semânticos (`--success`, `--warning`, `--danger`, `--info`) e categorias de streaming (`--cat-video`, `--cat-music`, etc.).
- **Cor como codificador.** Adaptando a técnica do Cifra Club (onde a cor identifica a tonalidade musical), aqui a cor identifica a categoria do serviço de streaming.

**Formato de cor:** HSL de 3 canais, seguindo a convenção shadcn/ui — `hsl(var(--primary))` e, quando necessário, `hsl(var(--primary) / 0.5)` para alpha.

**Atenção às fontes:** `Lexend Deca` e `Ourissanga Condensed` são proprietárias da Studio Sol. Antes de ir para produção, obtenha licença ou substitua por Nunito Sans e Oswald, respectivamente.

## ESTUDO-STACK

Este é o documento que justifica cada tecnologia escolhida: por que Next.js e não
Remix, por que PostgreSQL e não MySQL, por que BullMQ e não SQS. São 2255 linhas
de análise.

Use-o quando a decisão precisar ser revista, não como referência do dia a dia.
Para a tabela de stack consolidada, veja
[FUNDACOES/02-STACK-TEC.md](../FUNDACOES/02-STACK-TEC.md).

## PLANO-ORGANIZACAO-DOC

O plano que definiu a estrutura de pastas e o formato de cada documento de
módulo. Foi **executado** em 2026-10-20 — os monólitos foram quebrados conforme
ele previa. Mantido como referência porque a seção "Formato de Cada Documento"
descreve o template usado nos READMEs de módulo.

## Estado da documentação do projeto

A documentação foi organizada em 2026-10-20. Os dois monólitos que eram a fonte
(`DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md` e `ESTUDO-STACK-TECNOLOGICA.md`)
foram quebrados em documentos por área — o índice geral está em
[docs/README.md](../README.md). O plano que guiou o trabalho está em
[PLANO-ORGANIZACAO-DOC.md](PLANO-ORGANIZACAO-DOC.md).

Documentos ainda por escrever: `FUNDACOES/03-PADROES-CODIGO.md`,
`FUNDACOES/04-ESTRUTURA-PROJETO.md`, `DOMINIO/02-DOMINIO-NEGOCIO.md`,
`GUIAS/VALIDACAO.md`, `GUIAS/DEBUG.md` e os três em
[GLOSSARIO.md](GLOSSARIO.md), [ABREVIACOES.md](ABREVIACOES.md) e
[EXTERNAL.md](EXTERNAL.md).