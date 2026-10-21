<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 20 -->

# Roadmap de Implementação

### 1. Fase 1: Fundações (Semanas 1-3)

| Tarefa | Descrição | Responsável |
|--------|-----------|------------|
| Setup repositório | Turborepo, estrutura de pastas | Dev |
| Setup PostgreSQL | Supabase, schema Prisma | Dev |
| Setup Redis | Upstash, configuração | Dev |
| Setup Next.js | App Router, Tailwind, Radix | Dev |
| Setup Fastify | Módulos base, plugins | Dev |
| Autenticação | NextAuth, JWT, middleware | Dev |

### 2. Fase 2: E-commerce Core (Semanas 4-6)

| Tarefa | Descrição | Responsável |
|--------|-----------|------------|
| CRUD Produtos | Listagem, detalhes, admin | Dev |
| Checkout PIX | Criar payment, QR Code | Dev |
| Webhook MP | Processar confirmação | Dev |
| Entrega credencial | Job, criptografia | Dev |
| E-mail confirmação | Resend, templates | Dev |
| Página sucesso | Redirect, resumo | Dev |

### 3. Fase 3: Área do Cliente (Semanas 7-9)

| Tarefa | Descrição | Responsável |
|--------|-----------|------------|
| Dashboard | Visão geral | Dev |
| Minhas assinaturas | Listar, detalhes | Dev |
| Minhas credenciais | Visualizar, copiar | Dev |
| Histórico faturas | Listar, baixar PDF | Dev |
| Gerenciar conta | Editar perfil | Dev |
| Cancelar/pausar | Fluxo de cancelamento | Dev |

### 4. Fase 4: Assinaturas (Semanas 10-12)

| Tarefa | Descrição | Responsável |
|--------|-----------|------------|
| Cron renovações | Verificar vencimentos | Dev |
| Cobrança PIX | Processar renovação | Dev |
| Tentativas | Política de retry | Dev |
| Suspensões | Lógica de pausa | Dev |
| E-mails renovar | Lembretes, confirmação | Dev |
| Card/Boleto | Integração adicional | Dev |

### 5. Fase 5: Polish (Semanas 13-16)

| Tarefa | Descrição | Responsável |
|--------|-----------|------------|
| Deploy produção | Vercel + Fly.io | DevOps |
| Monitoramento | Sentry + Grafana | Dev |
| SEO | Meta tags, sitemap | Dev |
| LGPD | Política, termos | Dev |
| Testes E2E | Playwright | QA |
| Performance | Lighthouse, otimização | Dev |

### 6. Timeline Visual

```
Semana:  1-3    4-6    7-9    10-12   13-16
         ├───────┼───────┼───────┼───────┤
         
Fundações    ████████
         
E-commerce         █████████
         
Área Cliente             █████████
         
Assinaturas                      █████████
         
Polish                               ██████████

         ├───────┼───────┼───────┼───────┤
         Fase 1  Fase 2  Fase 3  Fase 4  Fase 5
```

---
