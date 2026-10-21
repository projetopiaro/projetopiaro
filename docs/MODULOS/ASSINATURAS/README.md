# Gestão de Assinaturas

## Status: 🔴 Pendente

## Objetivo
Modulo de gestao de assinaturas recorrentes.

## Responsabilidades
- Criacao de assinatura apos pagamento
- Renovacao automatica
- Suspensao por inadimplencia
- Cancelamento pelo cliente
- Reagendamento

## Dependências
- Pagamentos
- Credenciais

---

<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 9 -->

### 1. Subscription Service

```typescript
// apps/api/src/modules/subscriptions/subscription.service.ts
import { addMonths, addDays } from 'date-fns';

export class SubscriptionService {
  // Calcular datas baseado no plano
  calculateDates(plano: 'MONTHLY' | 'QUARTERLY' | 'YEARLY', startDate: Date = new Date()) {
    const durations = {
      MONTHLY: 1,
      QUARTERLY: 3,
      YEARLY: 12,
    };

    const dataFim = addMonths(startDate, durations[plano]);
    const dataProximaRenovacao = addDays(dataFim, -5);

    return {
      dataInicio: startDate,
      dataFim,
      dataProximaRenovacao,
    };
  }

  // Verificar se assinatura precisa renovar
  async checkRenewals(prisma: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        dataProximaRenovacao: {
          lte: today,
        },
      },
      include: {
        user: true,
        product: true,
      },
    });

    return subscriptions;
  }

  // Processar renovação
  async processRenewal(prisma: any, subscriptionId: string, mpService: any, emailService: any) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true, product: true },
    });

    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new Error('Assinatura não está ativa');
    }

    try {
      // Cobrar via Mercado Pago
      const payment = await mpService.createPixPayment({
        transactionAmount: Number(subscription.product.precoMensal),
        description: `Renovação ${subscription.product.nome}`,
        email: subscription.user.email,
        externalReference: `renewal_${subscription.id}_${Date.now()}`,
        notificationUrl: `${process.env.API_URL}/webhooks/mercadopago`,
      });

      // Atualizar assinatura
      const newDates = this.calculateDates(subscription.plano as any);
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          dataFim: newDates.dataFim,
          dataProximaRenovacao: newDates.dataProximaRenovacao,
          tentativasRenovacao: 0,
        },
      });

      // Criar fatura
      await prisma.invoice.create({
        data: {
          subscriptionId,
          status: 'PENDING',
          valor: subscription.product.precoMensal,
          dataVencimento: new Date(),
          mpPaymentId: payment.id,
        },
      });

      return { success: true, paymentId: payment.id };
    } catch (error) {
      // Incrementar tentativas
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          tentativasRenovacao: { increment: 1 },
        },
      });

      throw error;
    }
  }

  // Suspender assinatura (inadimplência)
  async suspend(prisma: any, subscriptionId: string) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'PAUSED' },
    });

    // Revogar credenciais
    await prisma.credential.updateMany({
      where: { assinaturaId: subscriptionId, revogada: false },
      data: { revogada: true },
    });
  }

  // Cancelar assinatura
  async cancel(prisma: any, subscriptionId: string, motivo?: string) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        motivoCancelamento: motivo,
        canceladaEm: new Date(),
      },
    });

    // Não revoga credenciais imediatamente - usuário tem acesso até fim do período
  }

  // Reativar assinatura
  async reactivate(prisma: any, subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    if (subscription.status === 'CANCELLED') {
      // Reativar com novo período
      const newDates = this.calculateDates(subscription.plano as any);
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          dataInicio: newDates.dataInicio,
          dataFim: newDates.dataFim,
          dataProximaRenovacao: newDates.dataProximaRenovacao,
        },
      });
    } else {
      // Apenas desatuar
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'ACTIVE' },
      });

      // Reativar credenciais
      await prisma.credential.updateMany({
        where: { assinaturaId: subscriptionId, revogada: true },
        data: { revogada: false },
      });
    }
  }
}
```

### 2. Cron de Renovação

```typescript
// apps/api/src/jobs/renewal.scheduler.ts
import { PrismaClient } from '@prisma/client';
import { MercadoPagoService } from '../services/mercadopago.service';
import { EmailService } from '../services/email.service';
import { SubscriptionService } from '../modules/subscriptions/subscription.service';

const prisma = new PrismaClient();
const mpService = new MercadoPagoService();
const emailService = new EmailService();
const subscriptionService = new SubscriptionService();

// Executar a cada hora
export async function processRenewals() {
  console.log('[Cron] Verificando renovações...');

  const subscriptions = await subscriptionService.checkRenewals(prisma);
  console.log(`[Cron] ${subscriptions.length} assinaturas para renovar`);

  for (const subscription of subscriptions) {
    try {
      const result = await subscriptionService.processRenewal(
        prisma,
        subscription.id,
        mpService,
        emailService
      );

      // Enviar e-mail de cobrança
      await emailService.enviarCobrancaRenovacao({
        to: subscription.user.email,
        nome: subscription.user.nome,
        produto: subscription.product.nome,
        valor: Number(subscription.product.precoMensal),
        dataVencimento: new Date(),
      });

      console.log(`[Cron] Renovação ${subscription.id} iniciada`);
    } catch (error) {
      console.error(`[Cron] Erro na renovação ${subscription.id}:`, error);

      // Se tentou muitas vezes, suspender
      if (subscription.tentativasRenovacao >= 3) {
        await subscriptionService.suspend(prisma, subscription.id);

        await emailService.enviarSuspensaoConta({
          to: subscription.user.email,
          nome: subscription.user.nome,
          produto: subscription.product.nome,
        });
      }
    }
  }
}

// Lembrete de renovação (5 dias antes)
export async function sendRenewalReminders() {
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      dataProximaRenovacao: {
        gte: new Date(fiveDaysFromNow.setHours(0, 0, 0, 0)),
        lt: new Date(fiveDaysFromNow.setHours(23, 59, 59, 999)),
      },
    },
    include: { user: true, product: true },
  });

  for (const subscription of subscriptions) {
    await emailService.enviarLembreteRenovacao({
      to: subscription.user.email,
      nome: subscription.user.nome,
      produto: subscription.product.nome,
      valor: Number(subscription.product.precoMensal),
      dataRenovacao: subscription.dataProximaRenovacao,
    });
  }
}
```

---
