# Integração de Pagamentos

## Status: 🔴 Pendente

## Objetivo
Modulo de processamento de pagamentos via Mercado Pago.

## Responsabilidades
- Criacao de preferencia de checkout
- Geracao de QR Code PIX
- Processamento de webhooks
- Confirmacao de pagamento
- Estorno e reembolso

## Dependências
- Autenticacao
- Produtos

---

<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 7 -->

### 1. Mercado Pago Service

```typescript
// apps/api/src/services/mercadopago.service.ts
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';

export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preApproval: PreApproval;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: {
        timeout: 10000,
      },
    });
    this.payment = new Payment(this.client);
    this.preApproval = new PreApproval(this.client);
  }

  // Criar pagamento PIX
  async createPixPayment(params: {
    transactionAmount: number;
    description: string;
    email: string;
    externalReference: string;
    notificationUrl: string;
  }) {
    const payment = await this.payment.create({
      body: {
        transaction_amount: params.transactionAmount,
        description: params.description,
        payment_method_id: 'pix',
        payer: {
          email: params.email,
        },
        external_reference: params.externalReference,
        notification_url: params.notificationUrl,
      },
    });

    return {
      id: payment.id,
      status: payment.status,
      point_of_interaction: payment.point_of_interaction,
    };
  }

  // Buscar pagamento
  async getPayment(paymentId: string) {
    return this.payment.get({ id: paymentId });
  }

  // Criar assinatura recorrente (Pre-approval)
  async createPreApproval(params: {
    email: string;
    valor: number;
    descricao: string;
    frequencia: number; // meses
    diaDebito: number;
    externalReference: string;
  }) {
    const preApproval = await this.preApproval.create({
      body: {
        payer_email: params.email,
        reason: params.descricao,
        external_reference: params.externalReference,
        auto_recurring: {
          frequency: params.frequencia,
          frequency_type: 'months',
          transaction_amount: params.valor,
          currency_id: 'BRL',
          debit_date: params.diaDebito,
        },
        back_url: process.env.FRONTEND_URL,
      },
    });

    return preApproval;
  }

  // Cancelar assinatura
  async cancelPreApproval(preApprovalId: string) {
    return this.preApproval.update({
      id: preApprovalId,
      body: { status: 'cancelled' },
    });
  }
}
```

### 2. Webhook Handler

```typescript
// apps/api/src/modules/webhooks/mercadopago.webhook.ts
import { FastifyInstance } from 'fastify';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { CredentialService } from '../../services/credential.service';
import { EmailService } from '../../services/email.service';
import { Queue } from 'bullmq';

interface WebhookPayload {
  action: string;
  api_version: string;
  data: { id: string };
  id: number;
  type: string;
  date_created: string;
}

export async function mercadopagoWebhookRoutes(
  app: FastifyInstance,
  deps: {
    mpService: MercadoPagoService;
    credentialService: CredentialService;
    emailService: EmailService;
    credentialQueue: Queue;
  }
) {
  const { mpService, credentialQueue } = deps;

  app.post('/webhooks/mercadopago', async (request, reply) => {
    // Verificar assinatura do webhook (production)
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers['x-signature'];
      if (!verifySignature(signature, request.body)) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }
    }

    const payload = request.body as WebhookPayload;

    // Log do webhook
    await app.prisma.webhookLog.create({
      data: {
        provider: 'mercadopago',
        eventType: payload.action || payload.type,
        payload: payload as any,
      },
    });

    // Processar baseado no tipo
    if (payload.type === 'payment') {
      await handlePaymentWebhook(app, mpService, credentialQueue, payload.data.id);
    }

    return { status: 'ok' };
  });
}

async function handlePaymentWebhook(
  app: FastifyInstance,
  mpService: MercadoPagoService,
  credentialQueue: Queue,
  paymentId: string
) {
  const payment = await mpService.getPayment(paymentId);
  const orderId = payment.external_reference;

  if (!orderId) {
    app.log.warn(`Payment ${paymentId} without external_reference`);
    return;
  }

  // Pagamento aprovado
  if (payment.status === 'approved') {
    const order = await app.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, product: true },
    });

    if (!order) {
      app.log.error(`Order ${orderId} not found`);
      return;
    }

    if (order.status === 'PAID') {
      app.log.info(`Order ${orderId} already processed`);
      return;
    }

    // Atualizar pedido
    await app.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Criar assinatura
    const assinatura = await app.prisma.subscription.create({
      data: {
        userId: order.userId,
        productId: order.productId,
        status: 'ACTIVE',
        plano: 'MONTHLY', // TODO: extrair do contexto
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dataProximaRenovacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Adicionar job para entregar credencial
    await credentialQueue.add(
      'entregar-credencial',
      {
        orderId,
        assinaturaId: assinatura.id,
        userId: order.userId,
        productId: order.productId,
        userEmail: order.user.email,
        userNome: order.user.nome,
        productNome: order.product.nome,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    app.log.info(`Order ${orderId} marked as PAID, subscription ${assinatura.id} created`);
  }

  // Pagamento expirado
  if (payment.status === 'expired') {
    await app.prisma.order.update({
      where: { id: orderId },
      data: { status: 'EXPIRED' },
    });
  }
}
```

---
