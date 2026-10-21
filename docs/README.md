# Documentação do Sistema

## Visão Geral

Plataforma e-commerce de produtos digitais com assinatura e entrega automatizada de credenciais. O cliente adquire acesso a serviços de streaming, VPN e armazenamento, recebe a credencial até 30 segundos após a confirmação do pagamento PIX, e a assinatura renova automaticamente.

Detalhamento: [FUNDACOES/01-ARQUITETURA.md](FUNDACOES/01-ARQUITETURA.md)

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Radix UI
- **Backend**: Fastify, Node.js 20, Prisma ORM
- **Database**: PostgreSQL 16 (Supabase)
- **Cache/Queue**: Redis (Upstash), BullMQ
- **Payments**: Mercado Pago (PIX nativo)
- **Email**: Resend + React Email
- **Storage**: Cloudflare R2
- **Deploy**: Vercel + Fly.io

Justificativa completa de cada escolha: [REFERENCIAS/ESTUDO-STACK.md](REFERENCIAS/ESTUDO-STACK.md)

## Documentos

### Fundações

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Arquitetura](FUNDACOES/01-ARQUITETURA.md) | Visão geral, público-alvo, diferenciais, diagrama de arquitetura, camadas |
| 02 | [Stack Tecnológica](FUNDACOES/02-STACK-TEC.md) | Tabela de tecnologias por camada |
| 05 | [Ambiente](FUNDACOES/05-AMBIENTE.md) | Ferramentas de desenvolvimento, scripts, setup |

### Domínio

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Modelo de Dados](DOMINIO/01-MODELO-DADOS.md) | Schema Prisma completo, migrations, índices |
| 03 | [Fluxos de Negócio](DOMINIO/03-FLUXOS-NEGOCIO.md) | Processos de compra, entrega, renovação, cancelamento |
| 04 | [Contrato de API](DOMINIO/04-API-CONTRATO.md) | Endpoints REST, estrutura do backend, webhooks |

### Módulos

| Módulo | Documento | Responsabilidade |
|--------|-----------|------------------|
| [Autenticação](MODULOS/AUTENTICACAO/) | README | Login, registro, JWT, OAuth, RBAC |
| [Pagamentos](MODULOS/PAGAMENTOS/) | README | Checkout PIX, preferência, webhooks, confirmação |
| [Credenciais](MODULOS/CREDENCIAIS/) | README | Geração, criptografia, entrega, mascaramento |
| [Assinaturas](MODULOS/ASSINATURAS/) | README | Criação, renovação, suspensão, cancelamento |
| [Admin](MODULOS/ADMIN/) | README | Painel administrativo |

Índice completo: [MODULOS/README.md](MODULOS/README.md)

### Infraestrutura

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Deploy](INFRAESTRUTURA/01-DEPLOY.md) | Docker, Fly.io, Vercel, variáveis de ambiente, custos |
| 02 | [Monitoramento](INFRAESTRUTURA/02-MONITORAMENTO.md) | Logs, métricas, alertas, health checks |
| 03 | [Segurança e LGPD](INFRAESTRUTURA/03-SECURITY.md) | Conformidade LGPD, direitos do titular, retenção |
| 04 | [Integrações](INFRAESTRUTURA/04-INTEGRACOES.md) | E-mail transacional, Resend, templates |

### Guias

| Documento | Conteúdo |
|-----------|-----------|
| [Implementação](GUIAS/IMPLEMENTACAO.md) | Estrutura do frontend, componentes, wireframes das telas |

### Referências

| Documento | Conteúdo |
|-----------|-----------|
| [Design Reference](REFERENCIAS/01-DESIGN-REFERENCE.md) | Design system completo, adaptado do Cifra Club (dark-only) |
| [Estudo de Stack](REFERENCIAS/ESTUDO-STACK.md) | Racionalização completa das escolhas de tecnologia |
| [Checklist](CHECKLIST.md) | Checklist de implementação |
| [Roadmap](ROADMAP.md) | Roadmap de implementação por fases |

## Ordem de Leitura

 Para quem está chegando no projeto:

1. [FUNDACOES/01-ARQUITETURA.md](FUNDACOES/01-ARQUITETURA.md) — visão geral e diagrama
2. [FUNDACOES/02-STACK-TEC.md](FUNDACOES/02-STACK-TEC.md) — o que roda onde
3. [DOMINIO/01-MODELO-DADOS.md](DOMINIO/01-MODELO-DADOS.md) — o schema
4. [DOMINIO/03-FLUXOS-NEGOCIO.md](DOMINIO/03-FLUXOS-NEGOCIO.md) — como o negócio opera
5. [Referência/01-DESIGN-REFERENCE.md](REFERENCIAS/01-DESIGN-REFERENCE.md) — como o sistema parece
6. Módulo específico → [MODULOS/](MODULOS/README.md)

Ao implementar uma tela:

- [DOMINIO/04-API-CONTRATO.md](DOMINIO/04-API-CONTRATO.md) para o contrato do backend
- [REFERENCIAS/01-DESIGN-REFERENCE.md](REFERENCIAS/01-DESIGN-REFERENCE.md) para tokens e componentes
- [GUIAS/IMPLEMENTACAO.md](GUIAS/IMPLEMENTACAO.md) para padrões de frontend

## Status dos Módulos

| Módulo | Status |
|--------|--------|
| Autenticação | 🔴 Pendente |
| Usuários | 🔴 Pendente |
| Produtos | 🔴 Pendente |
| Pagamentos | 🔴 Pendente |
| Assinaturas | 🔴 Pendente |
| Credenciais | 🔴 Pendente |
| Admin | 🔴 Pendente |

## Scripts Úteis

```bash
# Gerar novo módulo
./scripts/generate-module.sh <nome-do-modulo>

# Validar implementação
./scripts/validate-implementation.sh

# Rodar migrations
pnpm db:migrate

# Seed banco
pnpm db:seed
```

---

*Última atualização: 2026-10-20 — monólitos de documentação quebrados em 18 documentos*