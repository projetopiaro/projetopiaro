<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 11 -->

# E-mail Transacional

### 1. Resend + React Email

```typescript
// apps/api/src/services/email.service.ts
import { Resend } from 'resend';
import { ReactRenderer } from '@react-email/render';
import { CredenciaisEmail } from '../email/templates/credenciais';
import { PagamentoConfirmadoEmail } from '../email/templates/pagamento-confirmado';
import { LembreteRenovacaoEmail } from '../email/templates/lembrete-renovacao';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Minha Loja <noreply@minhaloja.com.br>';

export class EmailService {
  async enviarCredenciais(params: {
    to: string;
    nome: string;
    produto: string;
    credenciais: { nome: string; valor: string; isPassword: boolean }[];
    validade: Date;
  }) {
    const html = new ReactRenderer().toHtml(
      <CredenciaisEmail {...params} />
    );

    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Suas credenciais de acesso - ${params.produto}`,
      html,
    });
  }

  async enviarPagamentoConfirmado(params: {
    to: string;
    nome: string;
    produto: string;
    valor: number;
    formaPagamento: string;
    orderId: string;
  }) {
    const html = new ReactRenderer().toHtml(
      <PagamentoConfirmadoEmail {...params} />
    );

    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: 'Pagamento confirmado!',
      html,
    });
  }

  async enviarLembreteRenovacao(params: {
    to: string;
    nome: string;
    produto: string;
    valor: number;
    dataRenovacao: Date;
  }) {
    const html = new ReactRenderer().toHtml(
      <LembreteRenovacaoEmail {...params} />
    );

    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: 'Sua assinaturaRenova em breve',
      html,
    });
  }
}
```

### 2. Template de Credenciais

```typescript
// apps/api/src/email/templates/credenciais.tsx
import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from '@react-email/components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CredenciaisEmailProps {
  nome: string;
  produto: string;
  credenciais: { nome: string; valor: string; isPassword: boolean }[];
  validade: Date;
}

export function CredenciaisEmail({
  nome,
  produto,
  credenciais,
  validade,
}: CredenciaisEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '40px', maxWidth: '600px', borderRadius: '8px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <Img
              src={`${process.env.APP_URL}/logo.png`}
              width="150"
              alt="Logo"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Content */}
          <Section>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Olá, {nome}!
            </Text>
            <Text style={{ fontSize: '16px', color: '#525f7f', marginBottom: '24px' }}>
              Seu acesso ao <strong>{produto}</strong> foi confirmado! Abaixo estão suas credenciais de acesso:
            </Text>

            {/* Credentials Box */}
            <Section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
              {credenciais.map((cred, index) => (
                <Section key={index} style={{ marginBottom: index < credenciais.length - 1 ? '16px' : 0 }}>
                  <Text style={{ fontSize: '12px', color: '#8898aa', textTransform: 'uppercase' as const, marginBottom: '4px' }}>
                    {cred.nome}
                  </Text>
                  <Text style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: cred.isPassword ? '2px' : 'normal' }}>
                    {cred.isPassword ? '•'.repeat(12) : cred.valor}
                  </Text>
                </Section>
              ))}
            </Section>

            <Text style={{ fontSize: '16px', color: '#525f7f', marginBottom: '24px' }}>
              Sua assinatura está ativa até <strong>{format(validade, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>.
            </Text>

            <Button
              href={`${process.env.FRONTEND_URL}/dashboard/credenciais`}
              style={{ backgroundColor: '#656ee8', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}
            >
              Ver Minhas Credenciais
            </Button>
          </Section>

          <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0' }} />

          {/* Footer */}
          <Section>
            <Text style={{ fontSize: '12px', color: '#8898aa', textAlign: 'center' as const }}>
              Se você não reconhece esta compra, entre em contato com nosso suporte imediatamente.
            </Text>
            <Text style={{ fontSize: '12px', color: '#8898aa', textAlign: 'center' as const, marginTop: '8px' }}>
              © 2024 Minha Loja Digital. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

---
