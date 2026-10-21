#!/usr/bin/env bash
# Checkpoint de fim de sessão: commita tudo e sobe para o origin.
#
# Autenticação: SSH (chave em ~/.ssh/id_ed25519). Nenhuma credencial
# neste arquivo.
#
# Uso:  ./scripts/session-checkpoint.sh          relatório + confirmação + commit + push
#       ./scripts/session-checkpoint.sh --dry    só o relatório, nada é alterado
#       ./scripts/session-checkpoint.sh --yes    pula a confirmação

set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
AUTO_YES=0

for arg in "$@"; do
  case "$arg" in
    --dry) DRY=1 ;;
    --yes|-y) AUTO_YES=1 ;;
    -h|--help)
      sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $arg" >&2
      exit 2
      ;;
  esac
done

# ---------------------------------------------------------------- relatório

report() {
  local staged_count

  echo "════════════════════════════════════════════════════════"
  echo " RELATÓRIO DO CHECKPOINT — branch $BRANCH"
  echo "════════════════════════════════════════════════════════"
  echo " Remoto: $(git remote get-url origin)"
  echo

  # 1. estado geral
  local behind ahead
  behind="$(git rev-list --count HEAD..origin/$BRANCH 2>/dev/null || echo 0)"
  ahead="$(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo 0)"
  if [ "$behind" -gt 0 ] || [ "$ahead" -gt 0 ]; then
    echo "Branch divergente do remoto: $ahead commit(s) à frente, $behind atrás."
    echo "Um pull --rebase pode ser necessário antes do push."
    echo
  else
    echo "Branch em sincronia com origin/$BRANCH."
    echo
  fi

  # 2. arquivos alterados
  if git diff --cached --quiet && git diff --quiet; then
    echo "Nenhuma alteração pendente."
    return 1
  fi

  echo "Arquivos alterados:"
  git add -A
  git diff --cached --stat
  echo

  staged_count="$(git diff --cached --name-only | wc -l)"
  echo "$staged_count arquivo(s) serão commitados."
  echo

  # 3. arquivos sensíveis
  local secrets
  secrets="$(git diff --cached --name-only \
    | grep -Ev '\.(example|template|dist|md)$' \
    | grep -Ei '(^|/)(\.env($|\.)|.*\.env($|\.)|id_rsa|id_ed25519|.*\.(pem|key|p12|pfx)$|credentials?\.json|.*\.(secret|token)$)' \
    || true)"

  if [ -n "$secrets" ]; then
    echo "⚠  ALERTA — possíveis segredos entre os arquivos staged:"
    echo "$secrets" | sed 's/^/     /'
    echo "   Não prossiga até confirmar que nenhum deles deve ser versionado."
    echo
  fi

  # 4. resumo final
  echo "Mensagem do commit:"
  echo "  chore: checkpoint fim de sessão $(date '+%Y-%m-%d %H:%M')"
  echo
  echo "Destino do push: $(git remote get-url origin) → $BRANCH"
  echo "════════════════════════════════════════════════════════"
}

# ------------------------------------------------------------------ dry-run

if [ "${DRY:-0}" = "1" ]; then
  report
  exit 0
fi

if ! report; then
  echo "Nada a commitar em $BRANCH."
  exit 0
fi

# -------------------------------------------------------------- confirmação

if [ "$AUTO_YES" -eq 0 ]; then
  read -r -p "Confirma o commit e push? [s/N] " answer
  case "$answer" in
    s|S|sim|y|Y) ;;
    *) echo "Cancelado. Nada foi alterado."; exit 0 ;;
  esac
  echo
fi

# --------------------------------------------------------- commit + push

git commit -m "chore: checkpoint fim de sessão $(date '+%Y-%m-%d %H:%M')"

if git push origin "$BRANCH" 2>&1; then
  echo
  echo "Checkpoint aplicado em $BRANCH."
  git --no-pager log -1 --oneline
  git status -sb
else
  echo
  echo "Commit local criado, mas o PUSH FALHOU." >&2
  echo "O commit está preservado em $BRANCH. Investigue o erro acima." >&2
  exit 1
fi