<!-- Origem: DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md, secao 19 -->

# Ferramentas de Desenvolvimento

### 1. Configuração Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

### 2. ESLint + Prettier

```javascript
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn',
  },
};
```

```json
// packages/prettier-config/index.json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### 3. Git Hooks

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged
```

---
