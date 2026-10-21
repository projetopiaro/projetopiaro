// ============================================
// USERS MODULE - Routes
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

// Schemas
const updateProfileSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
});

const addressSchema = z.object({
  nome: z.string().min(1).max(100),
  cep: z.string().length(8),
  logradouro: z.string().min(1).max(200),
  numero: z.string().min(1).max(20),
  complemento: z.string().optional(),
  bairro: z.string().min(1).max(100),
  cidade: z.string().min(1).max(100),
  estado: z.string().length(2),
  padrao: z.boolean().optional(),
});

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

export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Apply auth to all routes
  server.addHook('preHandler', authenticate);

  // GET /api/users/me
  server.get(
    '/me',
    {
      schema: {
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              email: z.string(),
              nome: z.string(),
              telefone: z.string().nullable(),
              cpf: z.string().nullable(),
              emailVerificado: z.boolean(),
              createdAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.user.sub },
        select: {
          id: true,
          email: true,
          nome: true,
          telefone: true,
          cpf: true,
          emailVerificado: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          ...user,
          createdAt: user.createdAt.toISOString(),
        },
      };
    }
  );

  // PUT /api/users/me
  server.put(
    '/me',
    {
      schema: {
        body: updateProfileSchema,
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              email: z.string(),
              nome: z.string(),
              telefone: z.string().nullable(),
              cpf: z.string().nullable(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { nome, telefone, cpf } = request.body;

      const user = await app.prisma.user.update({
        where: { id: request.user.sub },
        data: {
          ...(nome && { nome }),
          ...(telefone !== undefined && { telefone }),
          ...(cpf !== undefined && { cpf }),
        },
        select: {
          id: true,
          email: true,
          nome: true,
          telefone: true,
          cpf: true,
        },
      });

      return {
        success: true,
        data: user,
      };
    }
  );

  // GET /api/users/me/addresses
  server.get(
    '/me/addresses',
    {
      schema: {
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.array(
              z.object({
                id: z.string(),
                nome: z.string(),
                cep: z.string(),
                logradouro: z.string(),
                numero: z.string(),
                complemento: z.string().nullable(),
                bairro: z.string(),
                cidade: z.string(),
                estado: z.string(),
                padrao: z.boolean(),
              })
            ),
          }),
        },
      },
    },
    async (request) => {
      const addresses = await app.prisma.address.findMany({
        where: { userId: request.user.sub },
        orderBy: [{ padrao: 'desc' }, { createdAt: 'desc' }],
      });

      return {
        success: true,
        data: addresses,
      };
    }
  );

  // POST /api/users/me/addresses
  server.post(
    '/me/addresses',
    {
      schema: {
        body: addressSchema,
        response: {
          201: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              nome: z.string(),
              cep: z.string(),
              logradouro: z.string(),
              numero: z.string(),
              complemento: z.string().nullable(),
              bairro: z.string(),
              cidade: z.string(),
              estado: z.string(),
              padrao: z.boolean(),
            }),
          }),
        },
      },
    },
    async (request) => {
      const { padrao, ...data } = request.body;

      // If this is the default address, unset others
      if (padrao) {
        await app.prisma.address.updateMany({
          where: { userId: request.user.sub },
          data: { padrao: false },
        });
      }

      const address = await app.prisma.address.create({
        data: {
          ...data,
          padrao: padrao || false,
          userId: request.user.sub,
        },
      });

      return reply.status(201).send({
        success: true,
        data: address,
      });
    }
  );

  // DELETE /api/users/me/addresses/:id
  server.delete(
    '/me/addresses/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              message: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const address = await app.prisma.address.findFirst({
        where: { id, userId: request.user.sub },
      });

      if (!address) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Endereço não encontrado',
          },
        });
      }

      await app.prisma.address.delete({
        where: { id },
      });

      return {
        success: true,
        data: {
          message: 'Endereço removido',
        },
      };
    }
  );
}
