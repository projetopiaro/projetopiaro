#!/bin/bash

# ============================================
# Script: Gerar novo módulo
# Uso: ./scripts/generate-module.sh <nome-do-modulo>
# ============================================

set -e

if [ -z "$1" ]; then
    echo "Erro: Nome do módulo é obrigatório"
    echo "Uso: ./scripts/generate-module.sh <nome-do-modulo>"
    exit 1
fi

MODULE_NAME=$1
MODULE_PATH="apps/api/src/modules/$MODULE_NAME"

# Verificar se módulo já existe
if [ -d "$MODULE_PATH" ]; then
    echo "Erro: Módulo '$MODULE_NAME' já existe"
    exit 1
fi

echo "📦 Gerando módulo: $MODULE_NAME"

# Criar estrutura de diretórios
mkdir -p "$MODULE_PATH/tests"

# Criar arquivos
cat > "$MODULE_PATH/${MODULE_NAME}.routes.ts" << EOF
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function ${MODULE_NAME}Routes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // TODO: Implementar rotas
  server.get('/', async () => {
    return { message: '${MODULE_NAME} routes' };
  });
}
EOF

cat > "$MODULE_PATH/${MODULE_NAME}.service.ts" << EOF
export class ${MODULE_NAME^}Service {
  // TODO: Implementar lógica de negócio
}
EOF

cat > "$MODULE_PATH/${MODULE_NAME}.repository.ts" << EOF
import { PrismaClient } from '@prisma/client';

export class ${MODULE_NAME^}Repository {
  constructor(private prisma: PrismaClient) {}

  // TODO: Implementar operações de banco
}
EOF

cat > "$MODULE_PATH/${MODULE_NAME}.schema.ts" << EOF
import { z } from 'zod';

export const ${MODULE_NAME}Schema = {
  // TODO: Definir schemas Zod
};
EOF

cat > "$MODULE_PATH/${MODULE_NAME}.types.ts" << EOF
// TODO: Definir tipos específicos do módulo
EOF

# Criar testes
cat > "$MODULE_PATH/tests/${MODULE_NAME}.service.test.ts" << EOF
describe('${MODULE_NAME} Service', () => {
  // TODO: Implementar testes
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
EOF

cat > "$MODULE_PATH/tests/${MODULE_NAME}.routes.test.ts" << EOF
describe('${MODULE_NAME} Routes', () => {
  // TODO: Implementar testes
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});
EOF

echo "✅ Módulo '$MODULE_NAME' criado em $MODULE_PATH"
echo ""
echo "Arquivos criados:"
echo "  - ${MODULE_NAME}.routes.ts"
echo "  - ${MODULE_NAME}.service.ts"
echo "  - ${MODULE_NAME}.repository.ts"
echo "  - ${MODULE_NAME}.schema.ts"
echo "  - ${MODULE_NAME}.types.ts"
echo "  - tests/${MODULE_NAME}.service.test.ts"
echo "  - tests/${MODULE_NAME}.routes.test.ts"
echo ""
echo "Próximos passos:"
echo "  1. Implementar a lógica do módulo"
echo "  2. Adicionar testes"
echo "  3. Registrar rotas no app principal"
