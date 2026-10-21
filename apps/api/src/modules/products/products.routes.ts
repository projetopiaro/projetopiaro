// ============================================
// PRODUCTS MODULE - Routes
// ============================================

import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

// ============================================
// ROUTES
// ============================================

export async function productRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/products - List all active products
  server.get(
    '/',
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
            success: z.literal(true),
            data: z.array(
              z.object({
                id: z.string(),
                nome: z.string(),
                slug: z.string(),
                descricaoCurta: z.string().nullable(),
                precoMensal: z.number(),
                precoTrimestral: z.number().nullable(),
                precoAnual: z.number().nullable(),
                imagemUrl: z.string().nullable(),
                categoria: z.string().nullable(),
                destaque: z.boolean(),
              })
            ),
            meta: z.object({
              total: z.number(),
              limit: z.number(),
              offset: z.number(),
            }),
          }),
        },
      },
    },
    async (request) => {
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
          select: {
            id: true,
            nome: true,
            slug: true,
            descricaoCurta: true,
            precoMensal: true,
            precoTrimestral: true,
            precoAnual: true,
            imagemUrl: true,
            categoria: true,
            destaque: true,
          },
        }),
        app.prisma.product.count({ where }),
      ]);

      return {
        success: true,
        data: products.map((p) => ({
          ...p,
          precoMensal: Number(p.precoMensal),
          precoTrimestral: p.precoTrimestral ? Number(p.precoTrimestral) : null,
          precoAnual: p.precoAnual ? Number(p.precoAnual) : null,
        })),
        meta: { total, limit, offset },
      };
    }
  );

  // GET /api/products/:slug - Get product by slug
  server.get(
    '/:slug',
    {
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              nome: z.string(),
              slug: z.string(),
              descricaoCurta: z.string().nullable(),
              descricao: z.string().nullable(),
              precoMensal: z.number(),
              precoTrimestral: z.number().nullable(),
              precoAnual: z.number().nullable(),
              imagemUrl: z.string().nullable(),
              categoria: z.string().nullable(),
              destaque: z.boolean(),
              metadata: z.any(),
            }),
          }),
          404: z.object({
            success: z.literal(false),
            error: z.object({
              code: z.string(),
              message: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const product = await app.prisma.product.findUnique({
        where: { slug, ativo: true },
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

      return {
        success: true,
        data: {
          ...product,
          precoMensal: Number(product.precoMensal),
          precoTrimestral: product.precoTrimestral
            ? Number(product.precoTrimestral)
            : null,
          precoAnual: product.precoAnual ? Number(product.precoAnual) : null,
        },
      };
    }
  );

  // GET /api/products/categories - List categories
  server.get(
    '/categories',
    {
      schema: {
        response: {
          200: z.object({
            success: z.literal(true),
            data: z.array(
              z.object({
                nome: z.string(),
                contagem: z.number(),
              })
            ),
          }),
        },
      },
    },
    async () => {
      const categories = await app.prisma.product.groupBy({
        by: ['categoria'],
        where: { ativo: true },
        _count: { categoria: true },
      });

      return {
        success: true,
        data: categories
          .filter((c) => c.categoria)
          .map((c) => ({
            nome: c.categoria!,
            contagem: c._count.categoria,
          })),
      };
    }
  );
}
