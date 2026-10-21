#!/usr/bin/env bash
# Checkpoint de fim de sessão: gera relatório, commita e sobe para o origin.
#
# Autenticação: SSH (chave em ~/.ssh/id_ed25519). Nenhuma credencial
# neste arquivo.
#
# Quando o agente (LLM) gera um resumo documentado ANTES de invocar este
# script, ele grava em .git/checkpoint-summary-pending.md. O script:
#   1. Incorpora o conteúdo como corpo do commit
#   2. Cria docs/CHECKPOINTS/<data>-<hash>.md com o mesmo conteúdo (+ header)
#   3. Commita e sobe
#   4. Limpa o arquivo .git/checkpoint-summary-pending.md
#
# Sem o arquivo de resumo, o commit recebe só mensagem título (modo legado).
#
# Uso:
#   ./scripts/session-checkpoint.sh          relatório + confirmação + commit + push
#   ./scripts/session-checkpoint.sh --dry    só o relatório
#   ./scripts/session-checkpoint.sh --yes    pula confirmação
#   ./scripts/session-checkpoint.sh --summary PATH  usa PATH como fonte do resumo
#                                             (em vez de .git/checkpoint-summary-pending.md)

set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
AUTO_YES=0
SUMMARY_SRC=".git/checkpoint-summary-pending.md"

for arg in "$@"; do
  case "$arg" in
    --dry) DRY=1 ;;
    --yes|-y) AUTO_YES=1 ;;
    --summary) SUMMARY_NEXT=1 ;;
    --summary=*) SUMMARY_SRC="${arg#--summary=}" ;;
    -h|--help)
      sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      # Tratamento do argumento de --summary
      if [ "${SUMMARY_NEXT:-0}" = "1" ]; then
        SUMMARY_SRC="$arg"
        SUMMARY_NEXT=0
      else
        echo "Opção desconhecida: $arg" >&2
        exit 2
      fi
      ;;
  esac
done

# ----------------------------------------------------------- geração do resumo

DATE_HUMAN="$(date '+%Y-%m-%d %H:%M')"
DATE_FILE="$(date '+%Y-%m-%d')"

COMMIT_TITLE="chore: checkpoint fim de sessão $DATE_HUMAN"
COMMIT_BODY=""
CHECKPOINT_DOC=""

# Se existe resumo do agente, lê e prepara corpo do commit
if [ -f "$SUMMARY_SRC" ]; then
  COMMIT_BODY="$(cat "$SUMMARY_SRC")"
  COMMIT_BODY="${COMMIT_BODY%"$'\n'"}"  # remove newline final se existir
fi

# --------------------------------------------------------------- relatório

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

  # 4. resumo do agente
  if [ -n "$COMMIT_BODY" ]; then
    echo "Resumo documentado pelo agente: SIM ($(printf '%s' "$COMMIT_BODY" | wc -l) linhas, $(printf '%s' "$COMMIT_BODY" | wc -c) caracteres)"
    echo "Será arquivado em docs/CHECKPOINTS/ e usado como corpo do commit."
    echo
  else
    echo "Resumo documentado pelo agente: não."
    echo "O commit vai ficar apenas com o título (modo curto)."
    echo
  fi

  # 5. arquivos que entrarão em docs/CHECKPOINTS/
  if [ -n "$COMMIT_BODY" ]; then
    echo "Arquivo de documentação: docs/CHECKPOINTS/$DATE_FILE-<hash>.md"
    echo "(o hash é gerado no commit, então o nome final aparece depois do push)"
    echo
  fi

  # 6. resumo final
  echo "Título do commit:"
  echo "  $COMMIT_TITLE"
  echo
  if [ -n "$COMMIT_BODY" ]; then
    echo "Corpo do commit: presente (ver docs/CHECKPOINTS/ depois do push)"
    echo
  fi
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

# --------------------------------------------- criar docs/CHECKPOINTS/<doc>

HASH_SHORT="$(git rev-parse --short HEAD)"

if [ -n "$COMMIT_BODY" ]; then
  mkdir -p docs/CHECKPOINTS
  # Git não versiona diretórios vazios — .gitkeep garante que a pasta persista
  touch docs/CHECKPOINTS/.gitkeep
  CHECKPOINT_DOC="docs/CHECKPOINTS/$DATE_FILE-$(date '+%H%M').md"

  {
    echo "<!--"
    echo "  Gerado automaticamente por scripts/session-checkpoint.sh"
    echo "  Data: $DATE_HUMAN"
    echo "  Branch: $BRANCH"
    echo "  Remoto: $(git remote get-url origin)"
    echo "  Commit anterior: $HASH_SHORT"
    echo "-->"
    echo
    echo "# Checkpoint — $DATE_HUMAN"
    echo
    echo "**Commit:** \`$COMMIT_TITLE\`"
    echo
    echo "**Branch:** \`$BRANCH\`"
    echo
    echo "**Arquivos alterados neste commit:**"
    echo
    echo '```'
    git diff --cached --stat
    echo '```'
    echo
    echo "## Resumo documentado"
    echo
    printf '%s' "$COMMIT_BODY"
    echo
  } > "$CHECKPOINT_DOC"

  git add "$CHECKPOINT_DOC"
fi

# --------------------------------------------------------- commit + push

# Monta a mensagem completa. git commit -F - lê do stdin.
if [ -n "$COMMIT_BODY" ]; then
  printf '%s\n\n%s\n' "$COMMIT_TITLE" "$COMMIT_BODY" | git commit -F -
else
  git commit -m "$COMMIT_TITLE"
fi

if git push origin "$BRANCH" 2>&1; then
  echo
  echo "Checkpoint aplicado em $BRANCH."
  git --no-pager log -1 --oneline
  git status -sb

  # Limpa o arquivo de resumo pendente
  if [ -f "$SUMMARY_SRC" ]; then
    rm -f "$SUMMARY_SRC"
  fi

  # Mostra caminho do arquivo de documentação criado
  if [ -n "$CHECKPOINT_DOC" ]; then
    echo
    echo "Documentação arquivada em: $CHECKPOINT_DOC"
  fi
else
  echo
  echo "Commit local criado, mas o PUSH FALHOU." >&2
  echo "O commit está preservado em $BRANCH. Investigue o erro acima." >&2
  echo "Arquivo .git/checkpoint-summary-pending.md mantido para próxima tentativa." >&2
  exit 1
fi