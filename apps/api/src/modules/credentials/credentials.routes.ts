// ============================================
// CREDENTIALS MODULE - Routes
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import crypto from 'crypto';

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
// HELPERS
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';

function encrypt(value: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

function decrypt(encrypted: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================
// ROUTES
// ============================================

export async function credentialRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Apply auth to all routes
  server.addHook('preHandler', authenticate);

  // GET /api/credentials - List user credentials
  server.get(
    '/',
    {
      schema: {
        querystring: z.object({
          active: z.boolean().optional(),
          limit: z.coerce.number().min(1).max(100).default(20),
          offset: z.coerce.number().min(0).default(0),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.array(
              z.object({
                id: z.string(),
                tipo: z.string(),
                revogada: z.boolean(),
                validade: z.string().nullable(),
                createdAt: z.string(),
                product: z.object({
                  id: z.string(),
                  nome: z.string(),
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
      const { active, limit, offset } = request.query;

      const where: Record<string, unknown> = {
        userId: request.user.sub,
      };

      if (active !== undefined) {
        where.revogada = !active;
        where.validade = { gte: new Date() };
      }

      const [credentials, total] = await Promise.all([
        app.prisma.credential.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        }),
        app.prisma.credential.count({ where }),
      ]);

      return {
        success: true,
        data: credentials.map((c) => ({
          id: c.id,
          tipo: c.tipo,
          revogada: c.revogada,
          validade: c.validade?.toISOString() || null,
          createdAt: c.createdAt.toISOString(),
          product: c.product,
        })),
        meta: { total, limit, offset },
      };
    }
  );

  // GET /api/credentials/:id - Get credential details (decrypted)
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
              tipo: z.string(),
              valores: z.array(
                z.object({
                  nome: z.string(),
                  valor: z.string(),
                  isPassword: z.boolean(),
                })
              ),
              validade: z.string().nullable(),
              revogada: z.boolean(),
              product: z.object({
                id: z.string(),
                nome: z.string(),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const credential = await app.prisma.credential.findFirst({
        where: { id, userId: request.user.sub },
        include: {
          product: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      if (!credential) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Credencial não encontrada',
          },
        });
      }

      if (credential.revogada) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'CREDENTIAL_REVOKED',
            message: 'Esta credencial foi revogada',
          },
        });
      }

      // Decrypt values
      const valores = (credential.valores as unknown as Array<{ nome: string; valor: string; iv: string | null; isPassword: boolean }>).map((v) => ({
        nome: v.nome,
        valor: v.iv ? decrypt(v.valor, v.iv) : v.valor,
        isPassword: v.isPassword,
      }));

      return {
        success: true,
        data: {
          id: credential.id,
          tipo: credential.tipo,
          valores,
          validade: credential.validade?.toISOString() || null,
          revogada: credential.revogada,
          product: credential.product,
        },
      };
    }
  );
}
