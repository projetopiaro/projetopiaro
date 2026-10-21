// ============================================
// MERCADO PAGO SERVICE
// ============================================

import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';

export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preApproval: PreApproval;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
      options: {
        timeout: 10000,
      },
    });
    this.payment = new Payment(this.client);
    this.preApproval = new PreApproval(this.client);
  }

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

    return payment;
  }

  async getPayment(paymentId: string) {
    return this.payment.get({ id: paymentId });
  }

  async createCardPayment(params: {
    token: string;
    transactionAmount: number;
    description: string;
    email: string;
    externalReference: string;
    notificationUrl: string;
  }) {
    const payment = await this.payment.create({
      body: {
        token: params.token,
        transaction_amount: params.transactionAmount,
        description: params.description,
        installments: 1,
        payment_method_id: 'visa',
        payer: {
          email: params.email,
        },
        external_reference: params.externalReference,
        notification_url: params.notificationUrl,
      },
    });

    return payment;
  }

  async refundPayment(paymentId: string) {
    return this.payment.refund({ id: paymentId });
  }
}

export const mercadoPagoService = new MercadoPagoService();
