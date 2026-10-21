<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secoes 6 e 17 -->

# Frontend

### 1. Estrutura de Pastas

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── (public)/
│   │   ├── produtos/
│   │   │   ├── page.tsx       # Lista produtos
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Detalhes produto
│   │   └── sobre/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   ├── checkout/
│   │   ├── success/
│   │   │   └── page.tsx
│   │   └── error/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx         # Layout com sidebar
│   │   ├── page.tsx           # Visão geral
│   │   ├── assinaturas/
│   │   ├── credenciais/
│   │   ├── faturas/
│   │   └── perfil/
│   ├── api/                    # BFF (Backend for Frontend)
│   │   ├── auth/
│   │   └── ...
│   └── globals.css
├── components/
│   ├── ui/                     # Radix primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── features/               # Domain components
│   │   ├── product-card.tsx
│   │   ├── checkout-pix.tsx
│   │   ├── subscription-card.tsx
│   │   ├── credential-viewer.tsx
│   │   └── ...
│   └── layouts/
│       ├── header.tsx
│       ├── footer.tsx
│       ├── sidebar.tsx
│       └── ...
├── lib/
│   ├── api.ts                  # Fetch client
│   ├── auth.ts                 # NextAuth config
│   ├── utils.ts               # cn(), formatCurrency(), etc
│   └── validators.ts          # Zod schemas
├── hooks/
│   ├── use-products.ts
│   ├── use-subscription.ts
│   └── ...
└── stores/
    ├── cart-store.ts
    └── ...
```

### 2. Componente de QR Code PIX

```typescript
// apps/web/src/components/features/checkout-pix.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface CheckoutPIXProps {
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
  amount: number;
  orderId: string;
}

export function CheckoutPIX({ qrCode, qrCodeBase64, expiresAt, amount }: CheckoutPIXProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetDate - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* QR Code */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <img
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code PIX"
            className="w-48 h-48 rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Pagamento com PIX</h2>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(amount)}
            </p>
          </div>

          {/* Timer */}
          <div className={cn(
            'flex items-center gap-2 text-sm',
            timeLeft < 300 ? 'text-red-600' : 'text-amber-600'
          )}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expira em {formatTime(timeLeft)}
          </div>

          {/* Copy code */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Código PIX:</p>
            <div className="flex gap-2">
              <Input
                value={qrCode.slice(0, 50) + '...'}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button onClick={handleCopy} variant="outline">
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">Como pagar:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX ou escaneie o QR Code</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### 3. Página de Produto

```typescript
// apps/web/src/app/(public)/produtos/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${slug}`, {
      next: { revalidate: 3600 }, // ISR: 1 hora
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const planos = [
    { key: 'MONTHLY', label: 'Mensal', price: product.precoMensal },
    { key: 'QUARTERLY', label: 'Trimestral', price: product.precoTrimestral || product.precoMensal * 3 * 0.9 },
    { key: 'YEARLY', label: 'Anual', price: product.precoAnual || product.precoMensal * 12 * 0.8 },
  ];

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          {product.imagemUrl ? (
            <Image
              src={product.imagemUrl}
              alt={product.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.categoria && (
              <Badge variant="secondary">{product.categoria}</Badge>
            )}
            <h1 className="text-3xl font-bold mt-2">{product.nome}</h1>
            <p className="text-muted-foreground mt-2">{product.descricaoCurta}</p>
          </div>

          <Tabs defaultValue="MONTHLY" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {planos.map((plano) => (
                <TabsTrigger key={plano.key} value={plano.key}>
                  {plano.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {planos.map((plano) => (
              <TabsContent key={plano.key} value={plano.key} className="space-y-4">
                <Card className="p-6">
                  <div className="text-3xl font-bold">
                    {formatCurrency(plano.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plano.label.toLowerCase().replace('al', '')}
                    </span>
                  </div>

                  {plano.key !== 'MONTHLY' && (
                    <p className="text-sm text-green-600 mt-1">
                      Economia de {Math.round((1 - plano.price / (product.precoMensal * (plano.key === 'QUARTERLY' ? 3 : 12))) * 100)}%
                    </p>
                  )}

                  <Button asChild className="w-full mt-4" size="lg">
                    <Link href={`/checkout/${product.id}?plano=${plano.key}`}>
                      Comprar Agora
                    </Link>
                  </Button>

                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      Acesso imediato após pagamento
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      Renova automaticamente
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      Cancele quando quiser
                    </li>
                  </ul>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Description */}
      {product.descricao && (
        <div className="mt-12 prose prose-slate max-w-none">
          <h2>Descrição</h2>
          <div dangerouslySetInnerHTML={{ __html: product.descricao }} />
        </div>
      )}
    </div>
  );
}
```

---

# Frontend - Wireframes

### 1. Homepage

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]          Home  Produtos  Sobre    [Login] [Carrinho] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │       Acesso instantâneo aos melhores serviços           │ │
│  │                                                          │ │
│  │       📱 💻 🔐 Streaming, VPN, Cloud Storage           │ │
│  │                                                          │ │
│  │       [Começar Agora]         [Ver Produtos]            │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ──────────  Produtos em Destaque  ──────────                │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│  │   [img]      │  │   [img]      │  │   [img]      │    │
│  │               │  │               │  │               │    │
│  │  VPN Premium  │  │ Streaming HD  │  │ Cloud 100GB  │    │
│  │               │  │               │  │               │    │
│  │  R$ 29,90/mês │  │ R$ 49,90/mês │  │ R$ 34,90/mês │    │
│  │               │  │               │  │               │    │
│  │ [Comprar Agora]│  │ [Comprar Agora]│  │ [Comprar Agora]│   │
│  └───────────────┘  └───────────────┘  └───────────────┘    │
│                                                              │
│  ──────────  Como Funciona  ──────────                       │
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                 │
│  │   1.    │    │   2.    │    │   3.    │                 │
│  │ Escolha │    │ Pague   │    │Acesso   │                 │
│  │ seu     │───▶│ com PIX │───▶│imediato  │                 │
│  │ plano   │    │         │    │          │                 │
│  └─────────┘    └─────────┘    └─────────┘                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  © 2024 Minha Loja | Termos | Privacidade | Contato         │
└──────────────────────────────────────────────────────────────┘
```

### 2. Checkout PIX

```
┌──────────────────────────────────────────────────────────────┐
│  ← Voltar                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐  ┌────────────────────────┐   │
│  │                          │  │  RESUMO DO PEDIDO      │   │
│  │  PAGAMENTO COM PIX      │  │                        │   │
│  │                          │  │  VPN Premium Mensal    │   │
│  │  Escaneie o QR Code:    │  │  ──────────────────    │   │
│  │                          │  │                        │   │
│  │  ┌──────────────────┐   │  │  Subtotal    R$ 29,90  │   │
│  │  │                  │   │  │                        │   │
│  │  │    [QR CODE]    │   │  │  ──────────────────    │   │
│  │  │                  │   │  │                        │   │
│  │  │                  │   │  │  Total       R$ 29,90  │   │
│  │  └──────────────────┘   │  │                        │   │
│  │                          │  │  Forma: PIX ✓          │   │
│  │  Valor: R$ 29,90         │  │                        │   │
│  │                          │  └────────────────────────┘   │
│  │  Copiar código PIX:      │                                │
│  │  ┌──────────────────┐   │  ⏱ Expira em: 25:43          │
│  │  │ 00020126580014... │ 🔎│                                │
│  │  └──────────────────┘   │  ┌────────────────────────┐   │
│  │                          │  │ ✓ Acesso liberado     │   │
│  │  [Copiar Código]        │  │   após confirmação    │   │
│  │                          │  └────────────────────────┘   │
│  └──────────────────────────┘                                │
│                                                              │
│  [Pagar com Cartão]                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3. Área do Cliente

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]           🔔 Notificações  ⚙️  [Avatar ▼]           │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  📊 Home   │  ┌─────────────────────────────────────────┐   │
│  📋 Assinaturas     │  │  Suas Assinaturas                  │   │
│  🔑 Credenciais     │  └─────────────────────────────────────────┘   │
│  📄 Faturas │                                                  │
│  🎫 Suporte │  ┌─────────────────────────────────────────┐   │
│  ⚙️ Perfil │  │  VPN Premium             Ativa    ●●●○○  │   │
│            │  │  Plano: Mensal                         │   │
│            │  │  Renovação: 15/11/2024               │   │
│            │  │  Valor: R$ 29,90/mês                  │   │
│            │  │                                        │   │
│            │  │  [Ver Credenciais]  [Gerenciar]        │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │  Cloud Storage 100GB    Ativa    ●●●○○  │   │
│            │  │  Plano: Anual                          │   │
│            │  │  Renovação: 01/01/2025                  │   │
│            │  │  Valor: R$ 249,90/ano                  │   │
│            │  │                                        │   │
│            │  │  [Ver Credenciais]  [Gerenciar]        │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

---
