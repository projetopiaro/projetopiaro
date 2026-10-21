# Domínio

Modelo de dados, regras de negócio e contratos de API.

## Documentos

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Modelo de Dados](01-MODELO-DADOS.md) | Schema Prisma completo, enums, relações, índices, migrations |
| 03 | [Fluxos de Negócio](03-FLUXOS-NEGOCIO.md) | Compra, entrega de credencial, renovação, cancelamento, inadimplência |
| 04 | [Contrato de API](04-API-CONTRATO.md) | Estrutura do backend Fastify, endpoints REST, webhooks de entrada e saída |

## Ainda não escritos

| # | Documento previsto | Status |
|---|---------------------|--------|
| 02 | Domínio de Negócio | 🔴 Pendente |

> Regras e invariantes estão hoje espalhadas entre [Fluxos](03-FLUXOS-NEGOCIO.md) e os
> documentos de módulo. O doc 02 deve consolidá-las quando escrito.

## Relacionados

- [Arquitetura](../FUNDACOES/01-ARQUITETURA.md)
- [Módulos](../MODULOS/README.md) — implementações de cada regra de negócio