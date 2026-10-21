#!/usr/bin/env bash
# Checkpoint de fim de sessão: gera relatório, commita por origem e sobe para o origin.
#
# Autenticação: SSH (chave em ~/.ssh/id_ed25519). Nenhuma credencial
# neste arquivo.
#
# Quando o agente (LLM) gera resumos ANTES de invocar este script, grava
# um arquivo por origem em .git/checkpoint-pending/<slug>.md. O script:
#   1. Lê cada arquivo de resumo
#   2. Staga só os arquivos que aquela origem declara cobrir
#   3. Para cada origem: cria docs/CHECKPOINTS/<data>-<hora>-<slug>.md,
#      commita com título + corpo, e segue
#   4. No final sobe uma vez para o origin
#   5. Limpa .git/checkpoint-pending/
#
# Para um arquivo ser associado a uma origem, ele precisa estar listado
# no campo "Arquivos:" do resumo. Formato esperado do resumo (cabeçalho
# markdown com propriedades):
#
#   Slug: <identificador-sem-espaço-único>
#   Origem: <nome da área / skill>
#   Arquivos:
#     - <caminho/relativo/1>
#     - <caminho/relativo/2>
#
#   ## Resumo
#   <markdown livre>
#
# Sem nenhum arquivo em .git/checkpoint-pending/, o script cai no modo
# legado: um commit único com tudo e sem documentação.
#
# Uso:
#   ./scripts/session-checkpoint.sh                 relatório + confirmação + commits + push
#   ./scripts/session-checkpoint.sh --dry           só o relatório
#   ./scripts/session-checkpoint.sh --yes           pula confirmação por origem
#   ./scripts/session-checkpoint.sh --plan          mostra plano de commits sem executar
#   ./scripts/session-checkpoint.sh --push          rola o push (default: ao final)
#   ./scripts/session-checkpoint.sh --no-push       não sobe (só local)

set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
AUTO_YES=0
DO_PUSH=1
DRY=0
PLAN=0
PENDING_DIR=".git/checkpoint-pending"

for arg in "$@"; do
  case "$arg" in
    --dry)     DRY=1 ;;
    --plan)    PLAN=1 ;;
    --yes|-y)  AUTO_YES=1 ;;
    --push)    DO_PUSH=1 ;;
    --no-push) DO_PUSH=0 ;;
    -h|--help)
      sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $arg" >&2
      exit 2
      ;;
  esac
done

# ----------------------------------------------------------- helpers

timestamp() { date '+%Y-%m-%d %H:%M'; }
date_file() { date '+%Y-%m-%d'; }
time_file() { date '+%H%M'; }

# Lê cabeçalho do arquivo de resumo. Define globals:
#   ORIGIN_SLUG, ORIGIN_NAME, ORIGIN_FILES (array), ORIGIN_BODY (markdown)
parse_pending() {
  local file="$1"
  ORIGIN_SLUG=""
  ORIGIN_NAME=""
  ORIGIN_FILES=()
  ORIGIN_BODY=""

  # Cabeçalho até a primeira linha "##". Tudo depois é corpo.
  local header body_raw
  # Cabeçalho = tudo ANTES da linha "## Resumo" (delimitador explícito).
  header="$(awk 'BEGIN{p=1} /^## Resumo/{p=0; exit} p{print}' "$file")"

  # Corpo = tudo a partir DEPOIS da linha "## Resumo", preservando
  # os subtítulos "## ..." que a IA escrever dentro do resumo.
  body_raw="$(awk 'BEGIN{p=0} /^## Resumo/{p=1; next} p{print}' "$file")"

  ORIGIN_BODY="$(printf '%s' "$body_raw" | sed 's/[[:space:]]*$//' | sed '/^$/N;/^\n$/D')"

  # Extrai slug do cabeçalho
  ORIGIN_SLUG="$(printf '%s\n' "$header" | awk -F': *' '/^Slug:/{print $2; exit}' | tr -d '[:space:]')"

  # Extrai nome da origem
  ORIGIN_NAME="$(printf '%s\n' "$header" | awk -F': *' '/^Origem:/{$1=""; sub(/^ */,""); print; exit}')"

  # Extrai lista de arquivos
  local in_files=0
  while IFS= read -r line; do
    case "$line" in
      "Arquivos:"*) in_files=1 ;;
      "")          in_files=0 ;;
      *)
        if [ "$in_files" = "1" ]; then
          # linha do tipo "- path" ou "  - path"
          local p
          p="$(printf '%s' "$line" | sed -E 's/^[[:space:]]*-[[:space:]]*//')"
          [ -n "$p" ] && ORIGIN_FILES+=("$p")
        fi
        ;;
    esac
  done <<EOF
$header
EOF

  if [ -z "$ORIGIN_SLUG" ]; then
    echo "Arquivo $file sem Slug no cabeçalho. Abortando." >&2
    return 1
  fi
  if [ -z "$ORIGIN_NAME" ]; then
    ORIGIN_NAME="$ORIGIN_SLUG"
  fi
  return 0
}

# ----------------------------------------------------------- coleta de pends

declare -A ORIGIN_TO_FILES
declare -a PENDING_FILES

if [ -d "$PENDING_DIR" ]; then
  while IFS= read -r f; do
    PENDING_FILES+=("$f")
  done < <(find "$PENDING_DIR" -maxdepth 1 -type f -name '*.md' | sort)
fi

# ----------------------------------------------------------- relatório

run_report() {
  echo "════════════════════════════════════════════════════════"
  echo " RELATÓRIO DO CHECKPOINT — branch $BRANCH"
  echo "════════════════════════════════════════════════════════"
  echo " Remoto: $(git remote get-url origin)"
  echo

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

  git add -A

  if git diff --cached --quiet; then
    echo "Nenhuma alteração pendente."
    return 1
  fi

  local total_files
  total_files="$(git diff --cached --name-only | wc -l)"
  echo "Total de arquivos modificados no working tree: $total_files"
  echo

  # Plano por origem
  echo "──────────────────────────────────────"
  echo " PLANO DE COMMITS SEPARADOS POR ORIGEM"
  echo "──────────────────────────────────────"
  echo

  if [ "${#PENDING_FILES[@]}" -eq 0 ]; then
    echo "Sem arquivos em $PENDING_DIR. Modo legado: 1 commit único."
    echo
    local secrets
    secrets="$(git diff --cached --name-only \
      | grep -Ev '\.(example|template|dist|md)$' \
      | grep -Ei '(^|/)(\.env($|\.)|.*\.env($|\.)|id_rsa|id_ed25519|.*\.(pem|key|p12|pfx)$|credentials?\.json|.*\.(secret|token)$)' \
      || true)"
    [ -n "$secrets" ] && {
      echo "⚠  ALERTA — possíveis segredos:"
      echo "$secrets" | sed 's/^/     /'
      echo
    }
    echo "  Commit 1: chore: checkpoint fim de sessão $(timestamp)"
    echo "           (todos os $total_files arquivos)"
    return 0
  fi

  echo "Origens declaradas (uma por commit):"
  for f in "${PENDING_FILES[@]}"; do
    parse_pending "$f" || continue
    echo
    echo "  Commit — origem: $ORIGIN_NAME"
    echo "           slug: $ORIGIN_SLUG"
    echo "           arquivos declarados: ${#ORIGIN_FILES[@]}"
    local matched=0 unmatched=()
    for tf in "${ORIGIN_FILES[@]}"; do
      if git diff --cached --name-only | grep -qx "$tf"; then
        matched=$((matched+1))
      else
        unmatched+=("$tf")
      fi
    done
    echo "           casam com working tree: $matched"
    if [ "${#unmatched[@]}" -gt 0 ]; then
      echo "           faltando no working tree (serão ignorados):"
      printf '             - %s\n' "${unmatched[@]}"
    fi
  done
  echo
  echo "Arquivos no working tree SEM origem declarada:"
  unassigned="$(mktemp)"
  for wt_file in $(git diff --cached --name-only); do
    covered=0
    for f in "${PENDING_FILES[@]}"; do
      parse_pending "$f" || continue
      for tf in "${ORIGIN_FILES[@]}"; do
        [ "$tf" = "$wt_file" ] && covered=1
      done
      [ "$covered" = "1" ] && break
    done
    [ "$covered" = "0" ] && echo "$wt_file" >> "$unassigned"
  done
  if [ -s "$unassigned" ]; then
    echo "  ⚠  Estes arquivos entraram no working tree mas nenhuma origem os cobriu:"
    sed 's/^/             - /' "$unassigned"
    echo "     Sugestão: criar uma origem 'outros' para eles, ou deixá-los para o commit catch-all final."
  else
    echo "  Todos os arquivos têm origem atribuída."
  fi
  rm -f "$unassigned"
  echo
  echo "Push ao final: $([ "$DO_PUSH" = "1" ] && echo sim || echo não)"
  echo "════════════════════════════════════════════════════════"
}

if [ "$PLAN" = "1" ] || [ "$DRY" = "1" ]; then
  if ! run_report; then
    echo "Nada a commitar em $BRANCH."
    exit 0
  fi
  exit 0
fi

if ! run_report; then
  echo "Nada a commitar em $BRANCH."
  exit 0
fi

# --------------------------------------------------------- confirmação única

if [ "$AUTO_YES" -eq 0 ]; then
  read -r -p "Confirma os commits e o push? [s/N] " answer
  case "$answer" in
    s|S|sim|y|Y) ;;
    *) echo "Cancelado. Nada foi alterado."; exit 0 ;;
  esac
  echo
fi

# --------------------------------------------------------- commits por origem

# Garante diretório de doc
mkdir -p docs/CHECKPOINTS
touch docs/CHECKPOINTS/.gitkeep

if [ "${#PENDING_FILES[@]}" -gt 0 ]; then
  # Reset stage inicial — o git add -A no relatório é nosso ground truth
  git add -A

  # 1) Commits por origem declarada
  for f in "${PENDING_FILES[@]}"; do
    parse_pending "$f" || continue
    timestamp="$(timestamp)"
    title="chore(${ORIGIN_SLUG}): checkpoint fim de sessão ${timestamp}"
    body="$ORIGIN_BODY"

    # Stage apenas arquivos desta origem
    git reset --quiet
    staged_any=0
    for tf in "${ORIGIN_FILES[@]}"; do
      if git diff --name-only | grep -qx "$tf"; then
        git add -- "$tf"
        staged_any=1
      fi
    done

    if [ "$staged_any" = "0" ]; then
      echo "⚠  Origem $ORIGIN_SLUG sem arquivos no working tree. Pulando."
      continue
    fi

    # Arquivo de doc específico desta origem
    doc_path="docs/CHECKPOINTS/$(date_file)-$(time_file)-${ORIGIN_SLUG}.md"
    {
      echo "<!--"
      echo "  Origem: $ORIGIN_NAME"
      echo "  Slug: $ORIGIN_SLUG"
      echo "  Data: $timestamp"
      echo "  Branch: $BRANCH"
      echo "  Remoto: $(git remote get-url origin)"
      echo "-->"
      echo
      echo "# Checkpoint — ${ORIGIN_NAME} — ${timestamp}"
      echo
      echo "**Commit:** \`${title}\`"
      echo
      echo "**Origem:** ${ORIGIN_NAME} (\`${ORIGIN_SLUG}\`)"
      echo
      echo "**Arquivos alterados neste commit:**"
      echo
      echo '```'
      git diff --cached --stat
      echo '```'
      echo
      echo "## Resumo"
      echo
      printf '%s\n' "$body"
    } > "$doc_path"
    git add -- "$doc_path"

    # Commit com corpo
    printf '%s\n\n%s\n' "$title" "$body" | git commit -F -

    echo "  ✓ commit ${ORIGIN_NAME} criado"
  done

  # 2) Catch-all para arquivos sem origem
  git add -A
  unassigned_after="$(git diff --cached --name-only)"
  if [ -n "$unassigned_after" ]; then
    timestamp="$(timestamp)"
    title="chore: checkpoint fim de sessão ${timestamp}"
    body="Arquivos sem origem declarada em $PENDING_DIR.
Vão juntos neste commit catch-all. Considere criar uma origem para eles no próximo checkpoint.

Arquivos incluídos:
$(git diff --cached --name-only | sed 's/^/  - /')"

    doc_path="docs/CHECKPOINTS/$(date_file)-$(time_file)-outros.md"
    {
      echo "<!--"
      echo "  Origem: catch-all (sem Slug declarado)"
      echo "  Data: $timestamp"
      echo "  Branch: $BRANCH"
      echo "-->"
      echo
      echo "# Checkpoint — outros — ${timestamp}"
      echo
      echo "**Commit:** \`${title}\`"
      echo
      echo "**Arquivos:**"
      echo
      echo '```'
      git diff --cached --stat
      echo '```'
      echo
      echo "## Resumo"
      echo
      printf '%s\n' "$body"
    } > "$doc_path"
    git add -- "$doc_path"

    printf '%s\n\n%s\n' "$title" "$body" | git commit -F -
    echo "  ✓ commit catch-all criado"
  fi

else
  # Modo legado — um commit único
  git add -A
  if git diff --cached --quiet; then
    echo "Nada a commitar."
    exit 0
  fi
  timestamp="$(timestamp)"
  title="chore: checkpoint fim de sessão ${timestamp}"
  doc_path="docs/CHECKPOINTS/$(date_file)-$(time_file).md"
  {
    echo "<!--"
    echo "  Modo legado (sem origens em $PENDING_DIR)"
    echo "  Data: $timestamp"
    echo "  Branch: $BRANCH"
    echo "-->"
    echo
    echo "# Checkpoint — sem separação de origens — ${timestamp}"
    echo
    echo "**Commit:** \`${title}\`"
    echo
    echo "**Arquivos:**"
    echo
    echo '```'
    git diff --cached --stat
    echo '```'
  } > "$doc_path"
  git add -- "$doc_path"
  git commit -m "$title"
  echo "  ✓ commit único criado"
fi

# --------------------------------------------------------- push

if [ "$DO_PUSH" = "1" ]; then
  if git push origin "$BRANCH" 2>&1; then
    echo
    echo "Commits aplicados em $BRANCH."
    git --no-pager log --oneline -n "$([ "${#PENDING_FILES[@]}" -gt 0 ] && echo "${#PENDING_FILES[@]}" || echo 1)"
    git status -sb
  else
    echo
    echo "PUSH FALHOU. Commits locais preservados em $BRANCH." >&2
    exit 1
  fi
else
  echo
  echo "Commits criados localmente em $BRANCH (push não foi executado — --no-push)."
  git --no-pager log --oneline -n 5
fi

# Limpa pending
rm -rf "$PENDING_DIR"
echo "$PENDING_DIR/ limpo."
