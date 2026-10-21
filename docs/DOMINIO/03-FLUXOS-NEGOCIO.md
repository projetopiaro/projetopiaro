<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 14 -->

# Fluxos de Negócio

### 1. Fluxo de Compra Completo

```mermaid
flowchart TD
    A[Cliente acessa produto] --> B{Não logado?}
    B -->|Sim| C[Login / Cadastro]
    B -->|Não| D[Seleciona plano]
    C --> D

    D --> E[Escolhe plano]
    E --> F[Clica em Comprar]
    F --> G[Redirect para checkout]

    G --> H{Criado?}
    H -->|Primeira vez| I[Dados do cliente]
    H -->|Já cadastrado| J[Confirmação]

    I --> J
    J --> K[Seleciona PIX]

    K --> L[Cria payment MP]
    L --> M[Exibe QR Code]
    M --> N{Aguarda pagamento}

    N -->|Timeout 30min| O[PEDIDO EXPIROU]
    N -->|Falha| P[ERRO - Tentar novamente]
    N -->|Sucesso| Q[Webhook MP]

    Q --> R[Atualiza pedido: PAID]
    R --> S[Cria ASSINATURA]
    S --> T[Queue: entregar-credencial]

    T --> U[Job processa]
    U --> V[Gera credencial]
    V --> W[Salva no banco]
    W --> X[Envia e-mail]
    X --> Y[Cliente recebe credenciais]

    Y --> Z[Redirect para /sucesso]
    Z --> AA[E-mail com resumo]

    style Q fill:#90EE90
    style R fill:#90EE90
    style S fill:#90EE90
    style T fill:#90EE90
    style U fill:#90EE90
    style V fill:#90EE90
```

### 2. Fluxo de Renovação

```mermaid
flowchart TD
    A[Cron: Todo dia 8h] --> B{Busca assinaturas}
    B --> C[dataProximaRenovacao = hoje}

    C --> D{Encontrou?}
    D -->|Não| E[Fim]
    D -->|Sim| F{Processar}

    F --> G[Cobrar PIX]
    G --> H{Sucesso?}

    H -->|Sim| I[Nova credencial]
    I --> J[E-mail confirmação]
    J --> K[Próximo ciclo]

    H -->|Não| L{Tentativas < 3}
    L -->|Sim| M[E-mail aviso]
    M --> N[Aguarda 2 dias]
    N --> G

    L -->|Não| O[SUSPENDER]
    O --> P[E-mail suspensão]
    P --> Q[Aguarda 7 dias]

    Q --> R{Quitou?}
    R -->|Sim| S[Reativar]
    S --> T[Credenciais reativadas]
    R -->|Não| U[CANCELAR]
    U --> V[Revoga credenciais]

    style I fill:#90EE90
    style S fill:#90EE90
    style U fill:#FFB6C1
```

---
