#!/usr/bin/env bash
set -Eeuo pipefail

TAG="${1:-}"
[[ -n "$TAG" ]] || { echo "Usage: $0 <tag>"; exit 2; }

PHP_BIN="${PHP_BIN:-/opt/php8.4/bin/php}"
DEPLOY_ROOT="${DEPLOY_ROOT:-$HOME/deployments/redeemerholding-prod}"
RELEASES="$DEPLOY_ROOT/releases"
SHARED="$DEPLOY_ROOT/shared"
CURRENT="$DEPLOY_ROOT/current"
RELEASE="$RELEASES/$TAG"
REPO_URL="${REPO_URL:-https://github.com/jbwansi/redeemer-holding.git}"
APP_URL="${APP_URL:-https://redeemerholding.com}"
EXPECTED_ENV="${EXPECTED_ENV:-production}"
EXPECTED_DB="${EXPECTED_DB:-ta8021_redeemerholding}"

ask_yes_no() {
  local message="$1" default="${2:-no}" prompt answer
  [[ "$default" == "yes" ]] && prompt="[Y/n]" || prompt="[y/N]"
  read -r -p "$message $prompt " answer
  if [[ -z "$answer" ]]; then
    [[ "$default" == "yes" ]]
    return
  fi
  case "${answer,,}" in y|yes|o|oui) return 0 ;; *) return 1 ;; esac
}

ok(){ printf '\033[32m[OK]\033[0m %s\n' "$*"; }
warn(){ printf '\033[33m[WARN]\033[0m %s\n' "$*"; }
fail(){ printf '\033[31m[ERREUR]\033[0m %s\n' "$*" >&2; exit 1; }
info(){ printf '\033[36m==>\033[0m %s\n' "$*"; }

echo
echo "Redeemer Holding - Déploiement PRODUCTION"
echo "========================================="
echo "Tag : $TAG"

[[ -x "$PHP_BIN" ]] || fail "PHP introuvable : $PHP_BIN"
"$PHP_BIN" -m | grep -qi '^zip$' || fail "Extension PHP zip absente."
command -v git >/dev/null || fail "git absent."
command -v curl >/dev/null || fail "curl absent."
command -v mysqldump >/dev/null || fail "mysqldump absent."
command -v composer >/dev/null || fail "composer absent."

[[ -f "$SHARED/.env" ]] || fail "shared/.env production absent."
[[ -d "$SHARED/storage" ]] || fail "shared/storage production absent."
mkdir -p "$SHARED/backups" "$RELEASES"

ENV_VALUE="$(grep -E '^APP_ENV=' "$SHARED/.env" | tail -1 | cut -d= -f2- | tr -d '"'\''[:space:]')"
URL_VALUE="$(grep -E '^APP_URL=' "$SHARED/.env" | tail -1 | cut -d= -f2- | tr -d '"'\''[:space:]')"
DB_VALUE="$(grep -E '^DB_DATABASE=' "$SHARED/.env" | tail -1 | cut -d= -f2- | tr -d '"'\''[:space:]')"

[[ "$ENV_VALUE" == "$EXPECTED_ENV" ]] || fail "APP_ENV inattendu : $ENV_VALUE"
[[ "$URL_VALUE" == "$APP_URL" ]] || fail "APP_URL inattendue : $URL_VALUE"
[[ "$DB_VALUE" == "$EXPECTED_DB" ]] || fail "DB_DATABASE inattendue : $DB_VALUE"
ok "Identité production confirmée : $ENV_VALUE / $DB_VALUE"

PREVIOUS=""
if [[ -e "$CURRENT" || -L "$CURRENT" ]]; then
  PREVIOUS="$(readlink -f "$CURRENT" || true)"
fi
echo "Release actuelle : ${PREVIOUS:-aucune}"

if [[ -e "$RELEASE" ]]; then
  warn "Le dossier release existe déjà : $RELEASE"
  if [[ -d "$RELEASE/.git" ]] && [[ "$(cd "$RELEASE" && git describe --tags --exact-match 2>/dev/null || true)" == "$TAG" ]]; then
    ok "Release existante cohérente avec le tag. Réutilisation."
  else
    fail "Release existante non vérifiable. Arrêt."
  fi
else
  info "Clone du tag $TAG"
  git clone --branch "$TAG" --depth 1 "$REPO_URL" "$RELEASE"
fi

cd "$RELEASE"
[[ "$(git describe --tags --exact-match 2>/dev/null || true)" == "$TAG" ]] || fail "Tag release incorrect."
ok "HEAD=$(git rev-parse --short HEAD) tag=$TAG"

[[ -f public/build/manifest.json ]] || fail "Build Vite absent."
ASSET_COUNT="$(find public/build/assets -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')"
[[ "$ASSET_COUNT" -gt 0 ]] || fail "Aucun asset Vite."
ok "Build Vite détecté ($ASSET_COUNT assets)."

rm -f .env
ln -s "$SHARED/.env" .env
rm -rf storage
ln -s "$SHARED/storage" storage
rm -rf public/storage
ln -s "$SHARED/storage/app/public" public/storage
ok "Liens production .env/storage/public-storage créés."

if [[ ! -d vendor ]]; then
  info "Installation Composer production"
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
fi

"$PHP_BIN" -r "require 'vendor/autoload.php'; echo 'AUTOLOAD_OK';" | grep -q AUTOLOAD_OK \
  || fail "Autoload PHP invalide."

"$PHP_BIN" artisan about >/dev/null
ok "Laravel démarre."

TMP_CNF="$(mktemp)"
chmod 600 "$TMP_CNF"
cleanup_tmp() { rm -f "${TMP_CNF:-}" 2>/dev/null || true; }
trap cleanup_tmp EXIT

TMP_CNF="$TMP_CNF" "$PHP_BIN" artisan tinker --execute='
file_put_contents(
    getenv("TMP_CNF"),
    "[client]\n" .
    "host=" . config("database.connections.mysql.host") . "\n" .
    "port=" . config("database.connections.mysql.port") . "\n" .
    "user=" . config("database.connections.mysql.username") . "\n" .
    "password=" . config("database.connections.mysql.password") . "\n"
);
' >/dev/null

BACKUP="$SHARED/backups/${EXPECTED_DB}-before-${TAG}-$(date +%Y%m%d-%H%M%S).sql"
info "Backup MySQL obligatoire -> $BACKUP"

mysqldump \
  --defaults-extra-file="$TMP_CNF" \
  --single-transaction \
  --routines \
  --triggers \
  "$EXPECTED_DB" > "$BACKUP"

[[ -s "$BACKUP" ]] || fail "Backup MySQL vide."
chmod 600 "$BACKUP"
ok "Backup MySQL créé."

rm -f "$TMP_CNF"
trap - EXIT

PENDING="$("$PHP_BIN" artisan migrate:status 2>/dev/null | grep -i 'Pending' || true)"
if [[ -n "$PENDING" ]]; then
  echo
  warn "Migration(s) pending :"
  echo "$PENDING"

  if ask_yes_no "Lancer les migrations PRODUCTION ?" "no"; then
    "$PHP_BIN" artisan migrate --force
    ok "Migrations appliquées."
  else
    fail "Migration(s) pending non appliquée(s)."
  fi
else
  ok "Aucune migration pending."
fi

info "Préparation des caches et validation des vues AVANT bascule"
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

VIEW_ERRORS="$(
  find storage/framework/views -type f -name '*.php' -print0 \
  | xargs -0 -n1 "$PHP_BIN" -l 2>&1 \
  | grep -v 'No syntax errors detected' || true
)"
if [[ -n "$VIEW_ERRORS" ]]; then
  echo "$VIEW_ERRORS"
  fail "Au moins une vue Blade compilée contient une erreur PHP."
fi
ok "Toutes les vues compilées sont syntaxiquement valides."

echo
echo "Bascule proposée :"
echo "  ancien : ${PREVIOUS:-aucun}"
echo "  nouveau: $RELEASE"

if ! ask_yes_no "Basculer PRODUCTION vers $TAG ?" "no"; then
  warn "Release préparée mais non activée."
  exit 0
fi

ln -sfn "$RELEASE" "$CURRENT"
[[ "$(readlink -f "$CURRENT")" == "$RELEASE" ]] || fail "Bascule current échouée."
ok "current production -> $TAG"

smoke() {
  local url="$1" expected="$2" code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || true)"
  echo "$url -> HTTP $code (attendu $expected)"
  [[ "$code" == "$expected" ]]
}

echo
info "Smoke tests production"
SMOKE_OK=1
smoke "$APP_URL/" "200" || SMOKE_OK=0
smoke "$APP_URL/dashboard" "302" || SMOKE_OK=0
smoke "$APP_URL/dashboard/trainings/import-export" "302" || SMOKE_OK=0
smoke "$APP_URL/dashboard/events/import-export" "302" || SMOKE_OK=0

if [[ "$SMOKE_OK" -eq 1 ]]; then
  ok "Smoke tests réussis."
  echo
  echo "PRODUCTION DEPLOYMENT OK"
  echo "Release : $TAG"
  echo "HEAD    : $(git rev-parse --short HEAD)"
  exit 0
fi

warn "Smoke test production échoué."
warn "Le rollback ci-dessous ne rollbacke PAS les migrations DB."

if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
  if ask_yes_no "Revenir immédiatement au release précédent ?" "yes"; then
    ln -sfn "$PREVIOUS" "$CURRENT"
    warn "Code revenu sur $(basename "$PREVIOUS"). Vérifier la compatibilité DB."
  fi
fi

exit 1
