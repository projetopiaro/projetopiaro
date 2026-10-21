// ============================================
// ERROR HANDLER PLUGIN
// ============================================

import { FastifyPluginAsync, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export const ErrorHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.setErrorHandler(
    async (
      error: FastifyError | ZodError,
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      // Log error
      request.log.error(error);

      // Zod validation error
      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.errors.reduce(
              (acc, err) => {
                const path = err.path.join('.');
                acc[path] = [err.message];
                return acc;
              },
              {} as Record<string, string[]>
            ),
          },
        });
      }

      // Fastify validation error
      if (error.validation) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.validation,
          },
        });
      }

      // JWT errors
      if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token de autenticação não fornecido',
          },
        });
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token de autenticação expirado',
          },
        });
      }

      if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de autenticação inválido',
          },
        });
      }

      // Rate limit error
      if (error.statusCode === 429) {
        return reply.status(429).send({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Muitas requisições. Tente novamente mais tarde.',
          },
        });
      }

      // Not found
      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Recurso não encontrado',
          },
        });
      }

      // Default error
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message:
            process.env.NODE_ENV === 'production'
              ? 'Erro interno do servidor'
              : error.message,
        },
      });
    }
  );

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Rota ${request.method} ${request.url} não encontrada`,
      },
    });
  });
};
