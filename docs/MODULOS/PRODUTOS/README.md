# Produtos

## Status: 🔴 Pendente

## Objetivo
Módulo de gestão de catálogo de produtos digitais.

## Responsabilidades
- CRUD de produtos
- Listagem pública de produtos
- Busca por categoria
- Destaque de produtos
- Preços por plano (mensal, trimestral, anual)

## Dependências
- Nenhuma

## Interfaces
### Entradas (Admin)
- POST /api/admin/products
- PUT /api/admin/products/:id
- DELETE /api/admin/products/:id
- GET /api/admin/products

### Saídas (Público)
- GET /api/products
- GET /api/products/:slug
- GET /api/categories

## Progresso

- [x] README (este arquivo)
- [ ] SPEC.md
- [ ] CODIGO.md
- [ ] TESTES.md

## Relacionados

- [Modelo de Dados](../../DOMINIO/01-MODELO-DADOS.md) — tabelas `Product`, `Category`, `Plan`
- [Contrato de API](../../DOMINIO/04-API-CONTRATO.md)
- [Design Reference](../../REFERENCIAS/01-DESIGN-REFERENCE.md) — categorias por cor
