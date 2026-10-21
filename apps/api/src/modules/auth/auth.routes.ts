// ============================================
// AUTH MODULE - Routes
// ============================================

import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schemas
const registerSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(2).max(100),
  senha: z.string().min(6).max(100),
  telefone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string(),
});

// ============================================
// ROUTES
// ============================================

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/auth/register
  server.post(
    '/register',
    {
      schema: {
        body: registerSchema,
        response: {
          201: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              email: z.string(),
              nome: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, nome, senha, telefone } = request.body;

      // Check if user exists
      const existing = await app.prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Este e-mail já está cadastrado',
          },
        });
      }

      // Hash password
      const senhaHash = await bcrypt.hash(senha, 10);

      // Create user
      const user = await app.prisma.user.create({
        data: {
          email,
          nome,
          telefone,
          senhaHash,
          emailVerificado: false,
        },
        select: {
          id: true,
          email: true,
          nome: true,
        },
      });

      // Generate verification token
      const token = crypto.randomUUID();
      await app.prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });

      // TODO: Send verification email

      return reply.status(201).send({
        success: true,
        data: user,
      });
    }
  );

  // POST /api/auth/login
  server.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              user: z.object({
                id: z.string(),
                email: z.string(),
                nome: z.string(),
              }),
              accessToken: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, senha } = request.body;

      // Find user
      const user = await app.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.senhaHash) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'E-mail ou senha incorretos',
          },
        });
      }

      // Verify password
      const valid = await bcrypt.compare(senha, user.senhaHash);
      if (!valid) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'E-mail ou senha incorretos',
          },
        });
      }

      // Generate token
      const token = app.jwt.sign(
        { sub: user.id, email: user.email, nome: user.nome },
        { expiresIn: '15m' }
      );

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            nome: user.nome,
          },
          accessToken: token,
        },
      };
    }
  );

  // POST /api/auth/logout
  server.post('/logout', async () => {
    // JWT is stateless, client should discard the token
    return { success: true, data: { message: 'Logout realizado' } };
  });
}
