<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secoes 5 e 15 -->

# Backend - API

### 1. Setup Fastify

```typescript
// apps/api/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { PrismaPlugin } from './plugins/prisma';
import { ErrorHandler } from './plugins/error-handler';

export function buildServer() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Schema validator
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Security plugins
  await app.register(cors, {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // handled by Next.js
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Auth
  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: '15m' },
  });

  // Database
  await app.register(PrismaPlugin);

  // Error handler
  await app.register(ErrorHandler);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
```

### 2. Estrutura de Módulos

```typescript
// apps/api/src/modules/products/product.routes.ts
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { productService } from './product.service';

const productSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  slug: z.string(),
  descricaoCurta: z.string().nullable(),
  precoMensal: z.number(),
  precoTrimestral: z.number().nullable(),
  precoAnual: z.number().nullable(),
  imagemUrl: z.string().nullable(),
  categoria: z.string().nullable(),
});

export async function productRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /produtos - Lista todos os produtos ativos
  server.get(
    '/produtos',
    {
      schema: {
        querystring: z.object({
          categoria: z.string().optional(),
          destaque: z.boolean().optional(),
          limit: z.coerce.number().min(1).max(100).default(20),
          offset: z.coerce.number().min(0).default(0),
        }),
        response: {
          200: z.object({
            data: z.array(productSchema),
            meta: z.object({
              total: z.number(),
              limit: z.number(),
              offset: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { categoria, destaque, limit, offset } = request.query;

      const where = {
        ativo: true,
        ...(categoria && { categoria }),
        ...(destaque !== undefined && { destaque }),
      };

      const [products, total] = await Promise.all([
        app.prisma.product.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ destaque: 'desc' }, { ordem: 'asc' }],
        }),
        app.prisma.product.count({ where }),
      ]);

      return {
        data: products.map(p => ({
          ...p,
          precoMensal: Number(p.precoMensal),
          precoTrimestral: p.precoTrimestral ? Number(p.precoTrimestral) : null,
          precoAnual: p.precoAnual ? Number(p.precoAnual) : null,
        })),
        meta: { total, limit, offset },
      };
    }
  );

  // GET /produtos/:slug - Detalhes do produto
  server.get(
    '/produtos/:slug',
    {
      schema: {
        params: z.object({ slug: z.string() }),
        response: {
          200: productSchema,
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const product = await app.prisma.product.findUnique({
        where: { slug, ativo: true },
      });

      if (!product) {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }

      return {
        ...product,
        precoMensal: Number(product.precoMensal),
        precoTrimestral: product.precoTrimestral ? Number(product.precoTrimestral) : null,
        precoAnual: product.precoAnual ? Number(product.precoAnual) : null,
      };
    }
  );
}
```

### 3. Middleware de Autenticação

```typescript
// apps/api/src/plugins/auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      nome: string;
      iat: number;
      exp: number;
    };
    user: {
      id: string;
      email: string;
      nome: string;
    };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export function generateTokens(app: FastifyInstance, user: { id: string; email: string; nome: string }) {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email, nome: user.nome },
    { expiresIn: '15m' }
  );

  const refreshToken = app.jwt.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
```

### 4. Rotas de Checkout PIX

```typescript
// apps/api/src/modules/checkout/checkout.routes.ts
import { z } from 'zod';
import { MercadoPagoService } from '../../services/mercadopago.service';
import { productService } from '../products/product.service';
import { authenticate } from '../../plugins/auth';

const checkoutSchema = z.object({
  productId: z.string().uuid(),
  plano: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
});

export async function checkoutRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const mpService = new MercadoPagoService();

  // POST /checkout/pix - Criar pagamento PIX
  server.post(
    '/checkout/pix',
    {
      preHandler: [authenticate],
      schema: {
        body: checkoutSchema,
        response: {
          201: z.object({
            orderId: z.string().uuid(),
            qrCode: z.string(),
            qrCodeBase64: z.string(),
            expiresAt: z.string().datetime(),
            valor: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user;
      const { productId, plano } = request.body;

      // Buscar produto
      const product = await productService.findById(productId);
      if (!product) {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }

      // Calcular valor baseado no plano
      const valor = calculatePrice(product, plano);

      // Criar pedido no banco
      const order = await app.prisma.order.create({
        data: {
          userId: user.id,
          productId,
          status: 'PENDING',
          tipoPagamento: 'PIX',
          valor,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        },
      });

      // Criar payment no Mercado Pago
      const mpPayment = await mpService.createPixPayment({
        transactionAmount: Number(valor),
        description: `${product.nome} - ${plano}`,
        email: user.email,
        externalReference: order.id,
        notificationUrl: `${process.env.API_URL}/webhooks/mercadopago`,
      });

      // Atualizar pedido com dados do MP
      const updatedOrder = await app.prisma.order.update({
        where: { id: order.id },
        data: {
          mpPaymentId: mpPayment.id,
          qrCodePix: mpPayment.point_of_interaction.transaction_data.qr_code,
          qrCodeBase64: mpPayment.point_of_interaction.transaction_data.qr_code_base64,
        },
      });

      return {
        orderId: updatedOrder.id,
        qrCode: updatedOrder.qrCodePix!,
        qrCodeBase64: updatedOrder.qrCodeBase64!,
        expiresAt: updatedOrder.expiresAt!.toISOString(),
        valor: Number(valor),
      };
    }
  );
}

function calculatePrice(product: any, plano: string): number {
  switch (plano) {
    case 'MONTHLY':
      return Number(product.precoMensal);
    case 'QUARTERLY':
      return Number(product.precoTrimestral || product.precoMensal * 3);
    case 'YEARLY':
      return Number(product.precoAnual || product.precoMensal * 12);
    default:
      return Number(product.precoMensal);
  }
}
```

---

# API e Webhooks

### 1. Endpoints Principais

```
# Autenticação
POST   /api/auth/register        - Cadastro
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
GET    /api/auth/session         - Verificar sessão

# Produtos (público)
GET    /api/produtos             - Lista produtos
GET    /api/produtos/:slug       - Detalhes produto
GET    /api/categorias           - Lista categorias

# Checkout
POST   /api/checkout/pix         - Criar pagamento PIX
GET    /api/checkout/:id/status  - Status do pedido
GET    /api/checkout/:id/qrcode  - QR Code PIX

# Assinaturas (auth)
GET    /api/assinaturas          - Minhas assinaturas
GET    /api/assinaturas/:id      - Detalhes assinatura
PUT    /api/assinaturas/:id/cancel   - Cancelar
PUT    /api/assinaturas/:id/pause    - Pausar
PUT    /api/assinaturas/:id/reactivate - Reativar

# Credenciais (auth)
GET    /api/credenciais          - Minhas credenciais
GET    /api/credenciais/:id      - Detalhes credencial

# Faturas (auth)
GET    /api/faturas              - Minhas faturas

# Usuário (auth)
GET    /api/usuario              - Perfil
PUT    /api/usuario              - Atualizar perfil

# Webhooks
POST   /api/webhooks/mercadopago  - IPN Mercado Pago

# Admin
GET    /api/admin/pedidos         - Lista pedidos
GET    /api/admin/produtos        - Lista produtos
PUT    /api/admin/produtos/:id    - Atualizar produto
GET    /api/admin/assinaturas     - Lista assinaturas
GET    /api/admin/relatorios      - Relatórios
```

### 2. Estrutura de Resposta

```typescript
// Sucesso
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Erro
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Exemplo
{
  "success": true,
  "data": {
    "id": "uuid-pedido",
    "status": "pending",
    "qrCodeBase64": "iVBORw0KG...",
    "expiresAt": "2024-01-15T14:30:00Z"
  }
}
```

---
