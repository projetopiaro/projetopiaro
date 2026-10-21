// ============================================
// CHECKOUT MODULE - Routes
// ============================================

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { MercadoPagoService } from '../../services/mercadopago.service';

// Schemas
const checkoutPixSchema = z.object({
  productId: z.string().uuid(),
  plano: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
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
// HELPERS
// ============================================

function calculatePrice(
  product: { precoMensal: unknown; precoTrimestral: unknown; precoAnual: unknown },
  plano: string
): number {
  switch (plano) {
    case 'MONTHLY':
      return Number(product.precoMensal);
    case 'QUARTERLY':
      return Number(product.precoTrimestral || Number(product.precoMensal) * 3);
    case 'YEARLY':
      return Number(product.precoAnual || Number(product.precoMensal) * 12);
    default:
      return Number(product.precoMensal);
  }
}

// ============================================
// ROUTES
// ============================================

export async function checkoutRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const mpService = new MercadoPagoService();

  // Apply auth to all routes
  server.addHook('preHandler', authenticate);

  // POST /api/checkout/pix - Create PIX payment
  server.post(
    '/pix',
    {
      schema: {
        body: checkoutPixSchema,
        response: {
          201: z.object({
            success: z.literal(true),
            data: z.object({
              orderId: z.string(),
              qrCode: z.string(),
              qrCodeBase64: z.string(),
              expiresAt: z.string(),
              valor: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user;
      const { productId, plano } = request.body;

      // Find product
      const product = await app.prisma.product.findUnique({
        where: { id: productId, ativo: true },
      });

      if (!product) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Produto não encontrado',
          },
        });
      }

      // Calculate price
      const valor = calculatePrice(product, plano);

      // Create order
      const order = await app.prisma.order.create({
        data: {
          userId: user.sub,
          productId,
          status: 'PENDING',
          tipoPagamento: 'PIX',
          valor,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        },
      });

      // Create Mercado Pago payment
      try {
        const mpPayment = await mpService.createPixPayment({
          transactionAmount: valor,
          description: `${product.nome} - ${plano}`,
          email: user.email,
          externalReference: order.id,
          notificationUrl: `${process.env.API_URL}/api/webhooks/mercadopago`,
        });

        // Update order with MP data
        const updatedOrder = await app.prisma.order.update({
          where: { id: order.id },
          data: {
            mpPaymentId: String(mpPayment.id),
            qrCodePix: mpPayment.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: mpPayment.point_of_interaction.transaction_data.qr_code_base64,
            codigoPix: mpPayment.point_of_interaction.transaction_data.qr_code,
          },
        });

        return reply.status(201).send({
          success: true,
          data: {
            orderId: updatedOrder.id,
            qrCode: updatedOrder.qrCodePix!,
            qrCodeBase64: updatedOrder.qrCodeBase64!,
            expiresAt: updatedOrder.expiresAt!.toISOString(),
            valor,
          },
        });
      } catch (error) {
        // Delete order if MP fails
        await app.prisma.order.delete({ where: { id: order.id } });

        return reply.status(500).send({
          success: false,
          error: {
            code: 'PAYMENT_ERROR',
            message: 'Erro ao criar pagamento. Tente novamente.',
          },
        });
      }
    }
  );

  // GET /api/checkout/:orderId/status - Get order status
  server.get(
    '/:orderId/status',
    {
      schema: {
        params: z.object({
          orderId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              orderId: z.string(),
              status: z.string(),
              valor: z.number(),
              tipoPagamento: z.string(),
              qrCodePix: z.string().nullable(),
              qrCodeBase64: z.string().nullable(),
              expiresAt: z.string().nullable(),
              paidAt: z.string().nullable(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { orderId } = request.params;

      const order = await app.prisma.order.findFirst({
        where: { id: orderId, userId: request.user.sub },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Pedido não encontrado',
          },
        });
      }

      return {
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          valor: Number(order.valor),
          tipoPagamento: order.tipoPagamento,
          qrCodePix: order.qrCodePix,
          qrCodeBase64: order.qrCodeBase64,
          expiresAt: order.expiresAt?.toISOString() || null,
          paidAt: order.paidAt?.toISOString() || null,
        },
      };
    }
  );
}
