// ============================================
// HEALTH ROUTES
// ============================================

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Basic health check
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Ready check (for k8s)
  server.get('/ready', async (request, reply) => {
    try {
      // Check database
      await app.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      };
    } catch (error) {
      return reply.status(503).send({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'error',
        },
      });
    }
  });

  // Detailed health check
  server.get('/health/detailed', async (request, reply) => {
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'ok',
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = {
      status: memUsage.heapUsed < memUsage.heapTotal ? 'ok' : 'warning',
      latency: memUsage.heapUsed,
    };

    const isHealthy = Object.values(checks).every((c) => c.status === 'ok' || c.status === 'warning');

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    });
  });
};
