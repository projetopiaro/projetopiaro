# Gestão de Credenciais

## Status: 🔴 Pendente

## Objetivo
Modulo de geracao e entrega de credenciais digitais.

## Responsabilidades
- Geracao de credenciais apos compra
- Criptografia de dados sensiveis
- Entrega via e-mail
- Visualizacao segura (com mascaramento)
- Revogacao e rotacao

## Dependências
- Assinaturas
- Pagamentos

---

<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 8 -->

### 1. Credential Service

```typescript
// apps/api/src/services/credential.service.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes

export interface CredentialValue {
  nome: string;
  valor: string;
  isPassword: boolean;
}

export interface GeneratedCredential {
  tipo: string;
  valores: CredentialValue[];
  validade: Date | null;
  metadata: Record<string, any>;
}

export class CredentialService {
  // Criptografar valor sensível
  encrypt(value: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  }

  // Descriptografar valor
  decrypt(encrypted: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Gerar credencial simulada (exemplo para VPN)
  generateVpnCredential(userId: string, productName: string): GeneratedCredential {
    const username = `user_${userId.slice(0, 8)}`;
    const password = this.generateSecurePassword();

    return {
      tipo: 'vpn_credentials',
      valores: [
        { nome: 'Servidor', valor: 'br1.vpn.example.com', isPassword: false },
        { nome: 'Porta', valor: '1194', isPassword: false },
        { nome: 'Protocolo', valor: 'UDP', isPassword: false },
        { nome: 'Usuário', valor: username, isPassword: false },
        { nome: 'Senha', valor: password, isPassword: true },
      ],
      validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        protocolo: 'OpenVPN',
        pais: 'Brasil',
        cidade: 'São Paulo',
      },
    };
  }

  // Gerar senha segura
  private generateSecurePassword(length = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    return Array.from({ length }, () => chars[crypto.randomInt(chars.length)]).join('');
  }

  // Salvar credencial no banco
  async saveCredential(
    prisma: any,
    params: {
      userId: string;
      productId: string;
      assinaturaId?: string;
      credential: GeneratedCredential;
    }
  ) {
    // Criptografar valores sensíveis
    const valoresCriptografados = params.credential.valores.map((v) => {
      if (v.isPassword) {
        const { encrypted, iv } = this.encrypt(v.valor);
        return { nome: v.nome, valor: encrypted, iv, isPassword: v.isPassword };
      }
      return { nome: v.nome, valor: v.valor, iv: null, isPassword: v.isPassword };
    });

    const credential = await prisma.credential.create({
      data: {
        userId: params.userId,
        productId: params.productId,
        assinaturaId: params.assinaturaId,
        tipo: params.credential.tipo,
        valores: valoresCriptografados,
        validade: params.credential.validade,
        detalhes: params.credential.metadata,
      },
    });

    return credential;
  }

  // Obter credencial descriptografada
  async getDecryptedCredential(prisma: any, credentialId: string, userId: string) {
    const credential = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId,
        revogada: false,
      },
    });

    if (!credential) {
      throw new Error('Credencial não encontrada');
    }

    // Descriptografar valores
    const valores = (credential.valores as any[]).map((v) => ({
      nome: v.nome,
      valor: v.isPassword && v.iv ? this.decrypt(v.valor, v.iv) : v.valor,
      isPassword: v.isPassword,
    }));

    return {
      id: credential.id,
      tipo: credential.tipo,
      valores,
      validade: credential.validade,
      detalhes: credential.detalhes,
    };
  }
}
```

### 2. Job de Entrega de Credencial

```typescript
// apps/api/src/jobs/credential.jobs.ts
import { Job } from 'bullmq';
import { CredentialService } from '../services/credential.service';
import { EmailService } from '../services/email.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const credentialService = new CredentialService();
const emailService = new EmailService();

export async function deliverCredentialJob(job: Job) {
  const { orderId, assinaturaId, userId, productId, userEmail, userNome, productNome } =
    job.data;

  console.log(`[Job ${job.id}] Entregando credencial para pedido ${orderId}`);

  // Determinar tipo de credencial baseado no produto
  // Em produção, isso viria de um provedor configurado
  const credential = credentialService.generateVpnCredential(userId, productNome);

  // Salvar credencial
  const savedCredential = await credentialService.saveCredential(prisma, {
    userId,
    productId,
    assinaturaId,
    credential,
  });

  // Enviar e-mail com credenciais
  await emailService.enviarCredenciais({
    to: userEmail,
    nome: userNome,
    produto: productNome,
    credenciais: credential.valores,
    validade: credential.validade,
  });

  console.log(`[Job ${job.id}] Credencial ${savedCredential.id} entregue com sucesso`);

  return { credentialId: savedCredential.id };
}
```

---
