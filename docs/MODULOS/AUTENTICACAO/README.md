# Autenticação e Segurança

## Status: 🔴 Pendente

## Objetivo
Modulo de autenticacao e seguranca do sistema.

## Responsabilidades
- Login com e-mail/senha
- Login com OAuth (Google)
- Registro de novos usuarios
- Recuperacao de senha
- Gestao de sessao (JWT + refresh)
- RBAC e controle de acesso

## Dependências
- Usuarios

---

<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 10 -->

### 1. NextAuth.js Configuration

```typescript
// apps/web/src/lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.senhaHash) return null;

        const isValid = await bcrypt.compare(password, user.senhaHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === 'update' && session) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

### 2. Middleware de Proteção

```typescript
// apps/web/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isOnAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
                        req.nextUrl.pathname.startsWith('/registro');

  // Proteger rotas de dashboard
  if (isOnProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar para dashboard se já logado
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

### 3. Headers de Segurança

```typescript
// apps/api/src/plugins/security.ts
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import helmet from '@fastify/helmet';

export const securityPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://www.mercadopago.com.br"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.mercadopago.com.br"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });
};
```

---
