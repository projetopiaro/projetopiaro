<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secoes 12 e 21 -->

# Infraestrutura e Deploy

### 1. Arquitetura de Deploy

```mermaid
graph TB
    subgraph "Cloudflare Edge"
        CDN[CDN Global<br/>300+ PoPs]
        WAF[WAF + DDoS<br/>Protection]
        R2[Cloudflare R2<br/>Storage]
    end

    subgraph "Vercel (Frontend)"
        NextApp[Next.js 14<br/>SSR/SSG/ISR]
        Edge[Edge Functions<br/>Middleware]
    end

    subgraph "Fly.io (Backend)"
        API1[API Server<br/>Docker]
        Worker1[BullMQ Worker<br/>Docker]
    end

    subgraph "Managed Services"
        SB[Supabase<br/>PostgreSQL 16]
        US[Upstash<br/>Redis]
    end

    subgraph "Integrations"
        MP[Mercado Pago<br/>PIX/Cartão]
        RS[Resend<br/>E-mail]
    end

    Users[Users] --> CDN
    CDN --> WAF
    WAF --> NextApp
    NextApp --> API1
    API1 --> SB
    API1 --> US
    API1 --> MP
    API1 --> RS
    Worker1 --> SB
    Worker1 --> US
    Worker1 --> RS
```

### 2. Dockerfile - Backend

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### 3. fly.toml - Backend

```toml
# apps/api/fly.toml
app = "ecommerce-api"
primary_region = "gru"
kill_signal = "SIGINT"
kill_timeout = "5s"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1

[deploy]
  release_command = "npx prisma migrate deploy"

[processes]
  web = "node dist/server.js"
  worker = "node dist/jobs/worker.js"
```

### 4. Variáveis de Ambiente

```bash
# .env.example

# ===================
# Database
# ===================
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# ===================
# Redis
# ===================
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# ===================
# Security
# ===================
JWT_SECRET="your-32-char-secret-here"
ENCRYPTION_KEY="32-byte-hex-key-for-aes-256-gcm"
AUTH_SECRET="your-auth-secret-here"

# ===================
# Mercado Pago
# ===================
MP_ACCESS_TOKEN="APP-TEST-xxxx"
MP_WEBHOOK_SECRET="xxxx"

# ===================
# E-mail
# ===================
RESEND_API_KEY="re_xxxx"

# ===================
# URLs
# ===================
APP_URL="https://seudominio.com.br"
FRONTEND_URL="https://seudominio.com.br"
API_URL="https://api.seudominio.com.br"

# ===================
# OAuth (opcional)
# ===================
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"

# ===================
# Storage
# ===================
R2_ACCOUNT_ID="xxx"
R2_ACCESS_KEY_ID="xxx"
R2_SECRET_ACCESS_KEY="xxx"
R2_BUCKET="ecommerce"
R2_PUBLIC_URL="https://pub.seudominio.com.br"
```

---

# Custos e Projeções

### 1. MVP (0-500 usuários)

| Serviço | Tier | Custo Mensal |
|---------|------|-------------|
| Vercel | Free | $0 |
| Fly.io | Free tier | $0 |
| Supabase | Free tier | $0 |
| Upstash | Free tier | $0 |
| Cloudflare R2 | 10GB free | $0 |
| Resend | 3k emails/mês | $0 |
| Sentry | Free tier | $0 |
| Domínio .com.br | - | R$40 |
| **Total MVP** | | **~R$40** |

### 2. Crescimento (500-5000 usuários)

| Serviço | Tier | Custo Mensal |
|---------|------|-------------|
| Vercel Pro | 100GB | $20 |
| Fly.io | 3 VMs | $10 |
| Supabase Pro | 8GB | $25 |
| Upstash | 10M ops | $10 |
| Cloudflare Pro | WAF | $20 |
| Resend | 50k | $20 |
| Sentry | 100k | $26 |
| **Total** | | **~$131** |

### 3. Escala (5000+ usuários)

| Serviço | Tier | Custo Mensal |
|---------|------|-------------|
| Vercel Pro | 1TB | $60 |
| Fly.io | 10 VMs | $50 |
| Supabase Team | 50GB | $75 |
| Upstash | 100M | $50 |
| Cloudflare Pro + Analytics | WAF | $50 |
| Resend | 250k | $60 |
| Sentry Business | 500k | $80 |
| Grafana Cloud | Metrics | $50 |
| **Total** | | **~$475** |

---
