// ============================================
// SUBSCRIPTIONS MODULE - Routes
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

// ============================================
// AUTH MIDDLEWARE
// ============================================

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Autenticação necessária',
      },
    });
  }
}

// ============================================
// ROUTES
// ============================================

export async function subscriptionRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Apply auth to all routes
  server.addHook('preHandler', authenticate);

  // GET /api/subscriptions - List user subscriptions
  server.get(
    '/',
    {
      schema: {
        querystring: z.object({
          status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']).optional(),
          limit: z.coerce.number().min(1).max(100).default(20),
          offset: z.coerce.number().min(0).default(0),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.array(
              z.object({
                id: z.string(),
                status: z.string(),
                plano: z.string(),
                dataInicio: z.string(),
                dataFim: z.string(),
                dataProximaRenovacao: z.string().nullable(),
                product: z.object({
                  id: z.string(),
                  nome: z.string(),
                  slug: z.string(),
                  imagemUrl: z.string().nullable(),
                }),
              })
            ),
            meta: z.object({
              total: z.number(),
              limit: z.number(),
              offset: z.number(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { status, limit, offset } = request.query;

      const where = {
        userId: request.user.sub,
        ...(status && { status }),
      };

      const [subscriptions, total] = await Promise.all([
        app.prisma.subscription.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                nome: true,
                slug: true,
                imagemUrl: true,
              },
            },
          },
        }),
        app.prisma.subscription.count({ where }),
      ]);

      return {
        success: true,
        data: subscriptions.map((s) => ({
          id: s.id,
          status: s.status,
          plano: s.plano,
          dataInicio: s.dataInicio.toISOString(),
          dataFim: s.dataFim.toISOString(),
          dataProximaRenovacao: s.dataProximaRenovacao?.toISOString() || null,
          product: s.product,
        })),
        meta: { total, limit, offset },
      };
    }
  );

  // GET /api/subscriptions/:id - Get subscription details
  server.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              status: z.string(),
              plano: z.string(),
              dataInicio: z.string(),
              dataFim: z.string(),
              dataProximaRenovacao: z.string().nullable(),
              tentativasRenovacao: z.number(),
              motivoCancelamento: z.string().nullable(),
              canceladaEm: z.string().nullable(),
              product: z.object({
                id: z.string(),
                nome: z.string(),
                slug: z.string(),
                precoMensal: z.number(),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const subscription = await app.prisma.subscription.findFirst({
        where: { id, userId: request.user.sub },
        include: {
          product: {
            select: {
              id: true,
              nome: true,
              slug: true,
              precoMensal: true,
            },
          },
        },
      });

      if (!subscription) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura não encontrada',
          },
        });
      }

      return {
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          plano: subscription.plano,
          dataInicio: subscription.dataInicio.toISOString(),
          dataFim: subscription.dataFim.toISOString(),
          dataProximaRenovacao: subscription.dataProximaRenovacao?.toISOString() || null,
          tentativasRenovacao: subscription.tentativasRenovacao,
          motivoCancelamento: subscription.motivoCancelamento,
          canceladaEm: subscription.canceladaEm?.toISOString() || null,
          product: {
            ...subscription.product,
            precoMensal: Number(subscription.product.precoMensal),
          },
        },
      };
    }
  );

  // PUT /api/subscriptions/:id/cancel - Cancel subscription
  server.put(
    '/:id/cancel',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          motivo: z.string().optional(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              status: z.string(),
              message: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { motivo } = request.body;

      const subscription = await app.prisma.subscription.findFirst({
        where: { id, userId: request.user.sub },
      });

      if (!subscription) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura não encontrada',
          },
        });
      }

      if (subscription.status === 'CANCELLED') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'ALREADY_CANCELLED',
            message: 'Assinatura já está cancelada',
          },
        });
      }

      const updated = await app.prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          motivoCancelamento: motivo,
          canceladaEm: new Date(),
        },
      });

      return {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          message: 'Assinatura cancelada com sucesso',
        },
      };
    }
  );

  // PUT /api/subscriptions/:id/reactivate - Reactivate subscription
  server.put(
    '/:id/reactivate',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              status: z.string(),
              dataFim: z.string(),
              message: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const subscription = await app.prisma.subscription.findFirst({
        where: { id, userId: request.user.sub },
        include: { product: true },
      });

      if (!subscription) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura não encontrada',
          },
        });
      }

      if (subscription.status === 'ACTIVE') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'ALREADY_ACTIVE',
            message: 'Assinatura já está ativa',
          },
        });
      }

      // Calculate new dates
      const duracaoMeses = subscription.plano === 'YEARLY' ? 12 : subscription.plano === 'QUARTERLY' ? 3 : 1;
      const dataFim = new Date();
      dataFim.setMonth(dataFim.getMonth() + duracaoMeses);

      const dataProximaRenovacao = new Date(dataFim);
      dataProximaRenovacao.setDate(dataProximaRenovacao.getDate() - 5);

      const updated = await app.prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          dataInicio: new Date(),
          dataFim,
          dataProximaRenovacao,
          motivoCancelamento: null,
          canceladaEm: null,
        },
      });

      return {
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          dataFim: updated.dataFim.toISOString(),
          message: 'Assinatura reativada com sucesso',
        },
      };
    }
  );
}
