<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 13 -->

# Monitoramento e Observabilidade

### 1. Sentry Setup

```typescript
// apps/api/src/plugins/sentry.ts
import * as Sentry from '@sentry/node';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  profilesSampleRate: 1.0,
});

export const sentryPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('onError', async (request, reply, error) => {
    Sentry.captureException(error, {
      extra: {
        url: request.url,
        method: request.method,
        body: request.body,
        userId: request.user?.id,
      },
    });
  });

  app.addHook('onRequest', async (request) => {
    Sentry.setUser({
      id: request.user?.id,
      email: request.user?.email,
    });
  });
};
```

### 2. Métricas Prometheus

```typescript
// apps/api/src/monitoring/metrics.ts
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export const register = new Registry();

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: 'Total orders created',
  labelNames: ['payment_type', 'product'],
  registers: [register],
});

export const ordersPaid = new Counter({
  name: 'orders_paid_total',
  help: 'Total orders paid',
  labelNames: ['payment_type'],
  registers: [register],
});

export const credentialsDelivered = new Histogram({
  name: 'credential_delivery_duration_ms',
  help: 'Time to deliver credentials',
  buckets: [100, 500, 1000, 2000, 5000, 10000],
  registers: [register],
});

export const activeSubscriptions = new Gauge({
  name: 'subscriptions_active',
  help: 'Number of active subscriptions',
  labelNames: ['product', 'plan'],
  registers: [register],
});

export const queueJobsPending = new Gauge({
  name: 'queue_jobs_pending',
  help: 'Pending jobs in queue',
  labelNames: ['queue'],
  registers: [register],
});
```

### 3. Health Check

```typescript
// apps/api/src/routes/health.ts
import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (request, reply) => {
    const checks = await Promise.all([
      checkDatabase(app),
      checkRedis(),
    ]);

    const isHealthy = checks.every((c) => c.healthy);

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: Object.fromEntries(checks.map((c) => [c.name, c])),
    });
  });

  app.get('/ready', async (request, reply) => {
    return reply.send({ status: 'ready' });
  });
}

async function checkDatabase(app: FastifyInstance) {
  try {
    await app.prisma.$queryRaw`SELECT 1`;
    return { name: 'database', healthy: true, latency: 0 };
  } catch (error) {
    return { name: 'database', healthy: false, error: 'Connection failed' };
  }
}

async function checkRedis() {
  // Implementar verificação do Redis
  return { name: 'redis', healthy: true, latency: 0 };
}
```

---
