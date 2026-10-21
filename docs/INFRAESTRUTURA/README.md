# Infraestrutura

Deploy, operação, segurança e integrações com serviços externos.

## Documentos

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Deploy](01-DEPLOY.md) | Dockerfiles, fly.toml, variáveis de ambiente, custos e projeções |
| 02 | [Monitoramento](02-MONITORAMENTO.md) | Logs, métricas, alertas, health checks |
| 03 | [Segurança e LGPD](03-SECURITY.md) | Conformidade LGPD, direitos do titular, retenção de dados |
| 04 | [Integrações](04-INTEGRACOES.md) | E-mail transacional via Resend, templates |

## Serviço externo por ambiente

| Serviço | Ambiente | Uso |
|---------|-----------|-----|
| Supabase (PostgreSQL) | produção e staging | Banco de dados |
| Upstash Redis | produção e staging | Cache, filas (BullMQ) |
| Vercel | produção e preview | Frontend Next.js |
| Fly.io | produção e staging | API Fastify + workers |
| Cloudflare R2 | produção | Storage de arquivos |
| Resend | produção | E-mail transacional |
| Mercado Pago | produção e staging | Pagamentos PIX |

## Relacionados

- [Ambiente](../FUNDACOES/05-AMBIENTE.md) — setup local
- [Autenticação](../MODULOS/AUTENTICACAO/) — RBAC e segurança de sessão
- [Pagamentos](../MODULOS/PAGAMENTOS/) — integração com Mercado Pago