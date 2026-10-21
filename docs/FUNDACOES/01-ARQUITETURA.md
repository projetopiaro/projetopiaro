<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secoes 1 e 3 -->

# Visão Geral do Sistema

### 1. Conceito

Plataforma e-commerce focada em **produtos digitais com entrega automatizada de credenciais** e **gestão de assinaturas recorrentes**. O cliente adquire acesso a serviços (streaming, VPN, armazenamento em nuvem, etc.), recebe suas credenciais instantaneamente após a confirmação do pagamento, e a assinatura renova automaticamente.

### 2. Público-Alvo

| Segmento | Características |
|----------|------------------|
| **Consumidor Final** | Brasileiro, familiarizado com PIX, busca conveniência e imediata |
| **Produtos Digitais** | Streaming (vídeo/música), VPN, cloud storage, software as a service |
| **Modelos de Preço** | Mensal, trimestral, anual — preferência por mensal no Brasil |

### 3. Diferenciais Competitivos

- **Entrega Instantânea**: Credenciais disponibilizadas em até 30 segundos após confirmação de pagamento
- **Renovação Automática**: Sistema gerencia renovações sem intervenção do cliente
- **Gestão de Assinaturas**: Cliente pode gerenciar (visualizar, cancelar, reagendar) pela área logada
- **Suporte ao Cliente**: Sistema de tickets integrado para problemas com credenciais

---

# Arquitetura do Sistema

### 1. Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser<br/>Next.js 14]
    end

    subgraph "Edge Layer"
        CF[Cloudflare<br/>CDN + WAF + DDoS]
    end

    subgraph "Frontend Tier (Vercel)"
        NextApp[Next.js App<br/>SSR/SSG/ISR]
    end

    subgraph "API Tier (Fly.io)"
        FastifyAPI[Fastify API<br/>Node.js 20]
        BullMQWorker[BullMQ Worker<br/>Background Jobs]
    end

    subgraph "Data Tier"
        Supabase[Supabase<br/>PostgreSQL 16]
        Upstash[Upstash Redis<br/>Cache + Queue]
    end

    subgraph "Storage"
        R2[Cloudflare R2<br/>Files/Images]
    end

    subgraph "External Services"
        MP[Mercado Pago<br/>PIX/Cartão/Boleto]
        Resend[Resend<br/>Transactional Email]
    end

    Browser --> CF
    CF --> NextApp
    NextApp --> FastifyAPI
    FastifyAPI --> Supabase
    FastifyAPI --> Upstash
    FastifyAPI --> MP
    FastifyAPI --> Resend
    FastifyAPI --> R2
    BullMQWorker --> Supabase
    BullMQWorker --> Upstash
    BullMQWorker --> Resend
```

### 2. Fluxo de Dados Principal

```mermaid
sequenceDiagram
    participant C as Cliente
    participant N as Next.js
    participant F as Fastify API
    participant S as Supabase
    participant R as Redis/Upstash
    participant M as Mercado Pago
    participant W as BullMQ Worker
    participant E as Resend
    participant R2 as R2 Storage

    C->>N: Acessa produto
    N->>F: GET /api/produtos/:slug
    F->>S: SELECT produto
    F->>R: GET cache
    R-->>F: cache hit/miss
    F-->>N: produto
    N-->>C: Página do produto

    C->>N: Clica em comprar
    N->>F: POST /api/checkout/pix
    F->>M: Criar payment PIX
    M-->>F: qr_code, expires_at
    F->>S: INSERT pedido (pending)
    F->>R: SET qr_code cache
    F-->>N: {qr_code_base64, qr_code}
    N-->>C: Exibe QR Code

    Note over C,M: Cliente paga via app bancário

    M->>F: POST /webhooks/mercadopago
    F->>S: UPDATE pedido (paid)
    F->>W: ADD job entregar-credencial
    W->>R2: Gerar credencial
    R2-->>W: credencial
    W->>S: INSERT credencial
    W->>E: Enviar e-mail
    W->>R: INVALIDATE cache
    E-->>C: E-mail com credenciais

    Note over W: Cron: Todo dia 8h
    W->>W: Processar renovações
    W->>M: Cobrar cartão
    M-->>W: success/failed
    W->>S: UPDATE assinatura
    W->>E: Enviar confirmação
```

### 3. Arquitetura Monorepo

```
ecommerce-digital/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   │   ├── (public)/   # Landing, produtos
│   │   │   │   ├── (auth)/     # Login, registro
│   │   │   │   ├── checkout/   # Checkout pages
│   │   │   │   ├── dashboard/  # Área do cliente
│   │   │   │   └── api/        # API routes (BFF)
│   │   │   ├── components/
│   │   │   │   ├── ui/        # Radix + Tailwind
│   │   │   │   ├── features/  # Domain components
│   │   │   │   └── layouts/   # Layouts
│   │   │   ├── lib/           # Utils, API client
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── stores/        # Zustand stores
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                    # Fastify Backend
│       ├── src/
│       │   ├── modules/        # Feature modules
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   ├── subscriptions/
│       │   │   ├── credentials/
│       │   │   └── webhooks/
│       │   ├── plugins/       # Fastify plugins
│       │   ├── services/      # Business logic
│       │   ├── jobs/          # BullMQ jobs
│       │   ├── schemas/       # Zod schemas
│       │   └── shared/        # Utils, types
│       ├── prisma/
│       │   └── schema.prisma
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── tsconfig/             # TypeScript configs
│   ├── eslint-config/        # ESLint configs
│   └── prettier-config/      # Prettier configs
│
├── turbo.json                # Turborepo config
├── package.json
└── README.md
```

---
