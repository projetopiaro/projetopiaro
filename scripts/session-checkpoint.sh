#!/usr/bin/env bash
# Checkpoint de fim de sessão: commita tudo e sobe para o origin.
#
# Autenticação: nenhuma credencial neste arquivo.
#   Configure uma vez:  gh auth login
#   (o gh guarda o token em ~/.config/gh/hosts.yml com permissão 600)
#
# Uso:  ./scripts/session-checkpoint.sh          commita e sobe
#       ./scripts/session-checkpoint.sh --dry    mostra o que seria commitado

set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$#" -gt 0 ] && [ "$1" = "--dry" ]; then
  echo "Branch: $BRANCH"
  git add -A --dry-run
  exit 0
fi

git add -A

if git diff --cached --quiet; then
  echo "Nada a commitar em $BRANCH."
  exit 0
fi

git commit -m "chore: checkpoint fim de sessão $(date '+%Y-%m-%d %H:%M')"
git push origin "$BRANCH"

echo "Checkpoint aplicado em $BRANCH."