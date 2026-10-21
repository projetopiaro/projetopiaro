// ============================================
// REFRESH TOKEN AUTHENTICATION PLUGIN
// ============================================

import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      nome: string;
      type: 'access' | 'refresh';
      iat: number;
      exp: number;
    };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Access token verification
  app.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
        const payload = request.user;

        if (payload.type !== 'access') {
          return reply.status(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token de acesso inválido',
            },
          });
        }
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Autenticação necessária',
          },
        });
      }
    }
  );

  // Refresh token verification
  app.decorate(
    'authenticateRefresh',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
        const payload = request.user;

        if (payload.type !== 'refresh') {
          return reply.status(401).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token de refresh inválido',
            },
          });
        }
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Refresh token necessário',
          },
        });
      }
    }
  );
};
