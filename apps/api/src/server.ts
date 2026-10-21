// ============================================
// SERVER - Fastify API
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import { PrismaPlugin } from './plugins/prisma';
import { ErrorHandlerPlugin } from './plugins/error-handler';
import { LoggerPlugin } from './plugins/logger';

// Routes
import { healthRoutes } from './routes/health';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/users.routes';
import { productRoutes } from './modules/products/products.routes';
import { checkoutRoutes } from './modules/orders/checkout.routes';
import { subscriptionRoutes } from './modules/subscriptions/subscriptions.routes';
import { credentialRoutes } from './modules/credentials/credentials.routes';
import { webhookRoutes } from './modules/webhooks/webhook.routes';

// ============================================
// BUILD SERVER
// ============================================

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  // ============================================
  // SCHEMA COMPILER
  // ============================================
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // ============================================
  // PLUGINS
  // ============================================

  // CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Helmet
  await app.register(helmet, {
    contentSecurityPolicy: false, // Handled by Next.js
  });

  // Rate Limit
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: '15m',
    },
  });

  // Database
  await app.register(PrismaPlugin);

  // Error Handler
  await app.register(ErrorHandlerPlugin);

  // Logger
  await app.register(LoggerPlugin);

  // ============================================
  // ROUTES
  // ============================================

  // Health
  await app.register(healthRoutes);

  // Auth (public)
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Products (public)
  await app.register(productRoutes, { prefix: '/api/products' });

  // Webhooks (no auth)
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });

  // Authenticated routes
  await app.register(async (app) => {
    // Users
    await app.register(userRoutes, { prefix: '/api/users' });

    // Checkout
    await app.register(checkoutRoutes, { prefix: '/api/checkout' });

    // Subscriptions
    await app.register(subscriptionRoutes, { prefix: '/api/subscriptions' });

    // Credentials
    await app.register(credentialRoutes, { prefix: '/api/credentials' });
  });

  // ============================================
  // READY
  // ============================================

  await app.ready();

  return app;
}

// ============================================
// START SERVER
// ============================================

async function start() {
  const app = await buildServer();

  const port = parseInt(process.env.API_PORT || '3001', 10);
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

  try {
    await app.listen({ port, host });
    console.log(`🚀 Server running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Start if run directly
start();
