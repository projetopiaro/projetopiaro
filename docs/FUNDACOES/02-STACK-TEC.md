<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 2 -->
> A racionalizacao completa das escolhas (por que cada tecnologia) esta em
> [ESTUDO-STACK.md](../REFERENCIAS/ESTUDO-STACK.md).

# Stack Tecnológica

### 1. Visão Geral da Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK TECNOLÓGICA RECOMENDADA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   FRONTEND  │  │   BACKEND   │  │    DATA     │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ Next.js 14  │  │ Fastify 4   │  │ PostgreSQL  │              │
│  │ TypeScript  │  │ TypeScript  │  │   16        │              │
│  │ TailwindCSS │  │ Prisma 5   │  │  Supabase   │              │
│  │ Radix UI    │  │ BullMQ     │  │  Redis      │              │
│  │ Zustand     │  │ NextAuth   │  │  Upstash    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  DEPLOY     │  │ INTEGRATIONS │  │    MONITOR  │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ Vercel      │  │ Mercado Pago│  │ Sentry      │              │
│  │ Fly.io      │  │ Resend     │  │ Grafana     │              │
│  │ Cloudflare  │  │ R2 Storage │  │ Prometheus  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Stack Detalhada

| Camada | Tecnologia | Versão | Justificativa |
|--------|------------|--------|---------------|
| **Frontend Framework** | Next.js | 14.x | SSR/SSG para SEO, App Router, Vercel integration |
| **UI Library** | Radix UI | 1.x | Headless, acessível, customizável |
| **Styling** | TailwindCSS | 3.4.x | Utility-first, perf, DX |
| **State Management** | Zustand | 4.x | Leve (~1kb), simples |
| **Server State** | React Query | 5.x | Cache, refetch, perf |
| **Forms** | React Hook Form + Zod | 7.x + 3.x | Uncontrolled, validation |
| **Backend Framework** | Fastify | 4.x | ~45k req/s, TypeScript native |
| **ORM** | Prisma | 5.x | DX, migrations, type-safe |
| **Database** | PostgreSQL | 16.x | JSONB, full-text, reliability |
| **Cache/Queue** | Redis (BullMQ) | 7.x | Performance, jobs |
| **Auth** | NextAuth.js | 5.x | JWT, OAuth, middleware |
| **Payments** | Mercado Pago SDK | 2.x | PIX native, webhooks |
| **Email** | Resend | 2.x | React Email, DX |
| **Storage** | Cloudflare R2 | - | Zero egress, CDN |
| **Monitoring** | Sentry + Grafana | - | Errors + metrics |
| **Deploy Frontend** | Vercel | - | Free tier, Edge |
| **Deploy Backend** | Fly.io | - | Docker, multi-region |

### 3. Por Que Essa Stack?

#### 1. Frontend: Next.js 14
- **SSR/SSG**: SEO perfeito para e-commerce
- **ISR**: Páginas de produto atualizam automaticamente
- **App Router**: Server Components = menos JS no cliente
- **Vercel**: Deploy gratuito, CDN global, preview PRs

#### 2. Backend: Fastify
- **Performance**: ~45k req/s (3x mais que Express)
- **TypeScript**: Nativo, sem configuração
- **Plugin System**: Extensível, modular
- **Validation**: JSON Schema ultra-rápido
- **Logs**: Pino integrado, estruturado

#### 3. Database: PostgreSQL + Supabase
- **JSONB**: Dados semi-estruturados (credenciais, metadata)
- **Full-text Search**: Busca sem ElasticSearch
- **Supabase**: Managed, backups, free tier generoso
- **Prisma**: Migrations declarativas, type-safe

#### 4. Queue: BullMQ
- **Reliability**: Retry, dead letters, priorities
- **Redis**: Já usado para cache
- **Cron**: Renovações agendadas
- **Dashboard**: @bull-board para debug

---
