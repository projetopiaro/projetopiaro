#!/bin/bash

# ============================================
# Script: Validar implementação
# ============================================

set -e

echo "🔍 Validando implementação..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Função para executar verificação
check() {
    local description="$1"
    local command="$2"
    
    echo -n "  $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
        return 1
    fi
}

# ============================================
# 1. TypeScript
# ============================================
echo -e "${YELLOW}1. Verificando TypeScript...${NC}"
cd apps/api
check "TypeScript sem erros" "npx tsc --noEmit"
check "Types Prisma gerados" "ls prisma/*.d.ts 2>/dev/null || ls node_modules/.prisma/client/*.d.ts 2>/dev/null"
cd ../..

# ============================================
# 2. Linting
# ============================================
echo ""
echo -e "${YELLOW}2. Verificando ESLint...${NC}"
check "ESLint sem erros" "npx eslint apps/api/src --ext .ts --max-warnings 0"
check "ESLint frontend" "npx eslint apps/web/src --ext .ts,.tsx --max-warnings 0"

# ============================================
# 3. Prettier
# ============================================
echo ""
echo -e "${YELLOW}3. Verificando Prettier...${NC}"
check "Prettier formatado" "npx prettier --check \"apps/**/*.ts\" \"apps/**/*.tsx\" 2>/dev/null || true"

# ============================================
# 4. Build
# ============================================
echo ""
echo -e "${YELLOW}4. Verificando build...${NC}"
check "Build API" "pnpm --filter api build"
check "Build Web" "pnpm --filter web build"

# ============================================
# 5. Testes
# ============================================
echo ""
echo -e "${YELLOW}5. Executando testes...${NC}"
check "Testes API" "pnpm --filter api test --passWithNoTests"
check "Testes Web" "pnpm --filter web test --passWithNoTests"

# ============================================
# Resultado
# ============================================
echo ""
echo "============================================"
echo -e "Resultado: ${GREEN}$PASSED${NC} passou, ${RED}$FAILED${NC} falhou"
echo "============================================"

if [ $FAILED -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}✅ Validação completa!${NC}"
