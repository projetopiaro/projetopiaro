# Usuários

## Status: 🔴 Pendente

## Objetivo
Módulo de gestão de usuários e perfis.

## Responsabilidades
- CRUD de perfil de usuário
- Atualização de dados pessoais
- Gestão de endereço
- Exclusão de conta (LGPD)
- Exportação de dados (LGPD)

## Dependências
- Autenticação

## Interfaces
### Entradas
- GET /api/users/me
- PUT /api/users/me
- DELETE /api/users/me
- GET /api/users/me/addresses
- POST /api/users/me/addresses
- PUT /api/users/me/addresses/:id
- DELETE /api/users/me/addresses/:id
- POST /api/users/me/export (LGPD)

## Progresso

- [x] README (este arquivo)
- [ ] SPEC.md
- [ ] CODIGO.md
- [ ] TESTES.md

## Relacionados

- [Modelo de Dados](../../DOMINIO/01-MODELO-DADOS.md) — tabela `User`
- [Contrato de API](../../DOMINIO/04-API-CONTRATO.md)
- [Segurança e LGPD](../../INFRAESTRUTURA/03-SECURITY.md) — direitos do titular
