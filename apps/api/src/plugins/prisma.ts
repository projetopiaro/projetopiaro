// ============================================
// PRISMA PLUGIN
// ============================================

import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const PrismaPlugin: FastifyPluginAsync = async (app) => {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

  // Connect
  await prisma.$connect();

  // Decorate fastify instance
  app.decorate('prisma', prisma);

  // Close connection on shutdown
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export { prisma } from '@prisma/client';
