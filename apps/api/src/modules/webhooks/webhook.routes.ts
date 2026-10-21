// ============================================
// WEBHOOKS MODULE - Routes
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { addMonths, addDays } from 'date-fns';

// ============================================
// ROUTES
// ============================================

export async function webhookRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const mpService = new MercadoPagoService();

  // POST /api/webhooks/mercadopago
  server.post(
    '/mercadopago',
    {
      schema: {
        body: z.any(),
        response: {
          200: z.object({
            status: z.string(),
          }),
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as Record<string, unknown>;

      // Log webhook
      await app.prisma.webhookLog.create({
        data: {
          provider: 'mercadopago',
          eventType: (body.action as string) || (body.type as string) || 'unknown',
          payload: body as never,
        },
      });

      // Only process payment updates
      if (body.type !== 'payment') {
        return { status: 'ok' };
      }

      const paymentId = body.data?.id;
      if (!paymentId) {
        return { status: 'ok' };
      }

      try {
        const payment = await mpService.getPayment(String(paymentId));
        const orderId = payment.external_reference;

        if (!orderId) {
          app.log.warn(`Payment ${paymentId} without external_reference`);
          return { status: 'ok' };
        }

        const order = await app.prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true, product: true },
        });

        if (!order) {
          app.log.error(`Order ${orderId} not found`);
          return { status: 'ok' };
        }

        // Payment approved
        if (payment.status === 'approved' && order.status === 'PENDING') {
          await app.prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          // Calculate subscription dates
          const dataFim = addMonths(new Date(), 1);
          const dataProximaRenovacao = addDays(dataFim, -5);

          // Create subscription
          const subscription = await app.prisma.subscription.create({
            data: {
              userId: order.userId,
              productId: order.productId,
              status: 'ACTIVE',
              plano: 'MONTHLY',
              dataInicio: new Date(),
              dataFim,
              dataProximaRenovacao,
            },
          });

          // Update order with subscription
          await app.prisma.order.update({
            where: { id: orderId },
            data: { subscriptionId: subscription.id },
          });

          // Create credential
          const credencialValores = [
            { nome: 'Servidor', valor: 'br1.vpn.example.com', isPassword: false },
            { nome: 'Porta', valor: '1194', isPassword: false },
            { nome: 'Usuário', valor: `user_${order.userId.slice(0, 8)}`, isPassword: false },
            { nome: 'Senha', valor: crypto.randomUUID().replace(/-/g, '').slice(0, 16), isPassword: true },
          ];

          await app.prisma.credential.create({
            data: {
              userId: order.userId,
              productId: order.productId,
              subscriptionId: subscription.id,
              tipo: 'vpn_credentials',
              valores: credencialValores,
              validade: dataFim,
            },
          });

          app.log.info(`Order ${orderId} processed, subscription ${subscription.id} created`);

          // TODO: Send confirmation email
        }

        // Payment expired
        if (payment.status === 'expired' && order.status === 'PENDING') {
          await app.prisma.order.update({
            where: { id: orderId },
            data: { status: 'EXPIRED' },
          });
          app.log.info(`Order ${orderId} expired`);
        }

        return { status: 'ok' };
      } catch (error) {
        app.log.error('Webhook processing error:', error);
        return reply.status(500).send({ status: 'error' });
      }
    }
  );
}

// Import crypto for password generation
import crypto from 'crypto';
