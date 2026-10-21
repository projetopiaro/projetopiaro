# Módulos

Documentação técnica de cada módulo do sistema.

## Módulos

| Módulo | Descrição | Status |
|--------|-----------|--------|
| [AUTENTICACAO/](AUTENTICACAO/) | Login, registro, JWT, OAuth, RBAC, segurança de sessão | 🔴 Pendente |
| [USUARIOS/](USUARIOS/) | Perfil, dados pessoais, endereço, exclusão LGPD | 🔴 Pendente |
| [PRODUTOS/](PRODUTOS/) | Catálogo de produtos, categorias, busca | 🔴 Pendente |
| [PAGAMENTOS/](PAGAMENTOS/) | Checkout PIX, preferência, webhooks, confirmação | 🔴 Pendente |
| [ASSINATURAS/](ASSINATURAS/) | Criação, renovação, suspensão, cancelamento | 🔴 Pendente |
| [CREDENCIAIS/](CREDENCIAIS/) | Geração, criptografia, entrega, mascaramento | 🔴 Pendente |
| [ADMIN/](ADMIN/) | Painel administrativo | 🔴 Pendente |

🔴 Pendente = módulo especificado na documentação, ainda não implementado.

## Dependências entre Módulos

```
USUARIOS ──────────┐
                   ├──> AUTENTICACAO ──┐
PRODUTOS ──────────┘                    │
                                        ├──> PAGAMENTOS ──> ASSINATURAS ──> CREDENCIAIS
                                        │
                                        └──> ADMIN (depende de todos)
```

- **AUTENTICACAO** é base — os demais validam JWT
- **PAGAMENTOS** requer credenciais da API do Mercado Pago
- **ASSINATURAS** consome os eventos de PAGAMENTOS
- **CREDENCIAIS** só é gerada após confirmação de pagamento

## Ordem de Implementação

1. [AUTENTICACAO](AUTENTICACAO/) — base para os demais
2. [USUARIOS](USUARIOS/)
3. [PRODUTOS](PRODUTOS/)
4. [PAGAMENTOS](PAGAMENTOS/) — requer credenciais do Mercado Pago
5. [ASSINATURAS](ASSINATURAS/) — requer PAGAMENTOS
6. [CREDENCIAIS](CREDENCIAIS/) — requer ASSINATURAS
7. [ADMIN](ADMIN/) — por último

Ver [Roadmap](../ROADMAP.md) para o detalhamento por fase.

## Estrutura de Cada Módulo

Cada módulo tem um `README.md` com a especificação completa. A estrutura-alvo
(expansão futura) é:

```
MODULO/
├── README.md     # Especificação (visão geral, responsabilidades, fluxos)
├── SPEC.md       # Contratos detalhados e tipos
├── CODIGO.md     # Código de referência
└── TESTES.md     # Casos de teste
```

Apenas o `README.md` existe hoje. Os demais entram conforme o módulo for
implementado.

## Relacionados

- [Modelo de Dados](../DOMINIO/01-MODELO-DADOS.md) — tabelas que cada módulo usa
- [Fluxos de Negócio](../DOMINIO/03-FLUXOS-NEGOCIO.md) — processos que atravessam módulos
- [Checklist](../CHECKLIST.md) — estado de implementação por item