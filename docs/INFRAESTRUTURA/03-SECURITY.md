<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 16 -->

# LGPD Compliance

### 1. Dados Coletados

| Dado | Base Legal | Finalidade | Retenção |
|------|------------|------------|----------|
| Nome, Email | Contrato (Art. 7º, V) | Conta, entrega | Vida útil da conta |
| CPF | Contrato (Art. 7º, V) | Identificação fiscal | 5 anos após último uso |
| Telefone | Contrato (Art. 7º, V) | Suporte, notificações | Vida útil da conta |
| Endereço | Contrato (Art. 7º, V) | Cobrança, entrega | 5 anos |
| Dados pagamento | Contrato (Art. 7º, V) | Processamento | 5 anos |
| IP, logs | Legítimo interesse (Art. 7º, IX) | Segurança | 1 ano |

### 2. Implementação

```typescript
// apps/api/src/modules/users/rights.controller.ts
import { z } from 'zod';
import { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/auth';

const direitoSchema = z.enum([
  'confirmacao',
  'acesso',
  'correcao',
  'anonimizacao',
  'portabilidade',
  'eliminacao',
]);

export async function rightsRoutes(app: FastifyInstance) {
  // Endpoint para exercício de direitos LGPD
  app.post(
    '/api/direitos',
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          tipo: direitoSchema,
          detalhes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const user = request.user;
      const { tipo, detalhes } = request.body;

      // Log da solicitação
      await app.prisma.auditLog.create({
        data: {
          userId: user.id,
          acao: 'LGPD_REQUEST',
          entidade: 'usuario',
          entidadeId: user.id,
          dadosNovos: { tipo, detalhes },
        },
      });

      // Processar baseado no tipo
      switch (tipo) {
        case 'acesso':
          // Exportar dados do usuário
          return await exportUserData(app, user.id);

        case 'correcao':
          // Retornar instruções
          return { instrucoes: 'Acesse /perfil para corrigir seus dados' };

        case 'eliminacao':
          // Processar exclusão (anonimização)
          return await anonymizeUser(app, user.id);

        case 'portabilidade':
          // Gerar arquivo JSON
          return await generatePortabilityFile(app, user.id);

        default:
          return { mensagem: 'Solicitação registrada. Processaremos em até 15 dias.' };
      }
    }
  );
}

async function exportUserData(app: FastifyInstance, userId: string) {
  const user = await app.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nome: true,
      cpf: true,
      telefone: true,
      createdAt: true,
    },
  });

  const subscriptions = await app.prisma.subscription.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      plano: true,
      dataInicio: true,
      dataFim: true,
    },
  });

  return {
    usuario: user,
    assinaturas: subscriptions,
    exportadoEm: new Date().toISOString(),
  };
}
```

---
