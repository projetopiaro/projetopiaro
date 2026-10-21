// ============================================
// LOGS PLUGIN
// ============================================

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

export const LoggerPlugin: FastifyPluginAsync = async (app) => {
  // Add request id
  app.addHook('onRequest', async (request: FastifyRequest) => {
    request.log.info({
      msg: 'Incoming request',
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  });

  // Log response
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info({
      msg: 'Request completed',
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    });
  });
};
