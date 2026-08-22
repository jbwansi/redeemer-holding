#!/usr/bin/env bash
set -Eeuo pipefail

TAG="${1:-}"
[[ -n "$TAG" ]] || { echo "Usage: $0 v1.0.0-rc.N"; exit 2; }

PHP_BIN="${PHP_BIN:-/opt/php8.4/bin/php}"
DEPLOY_ROOT="${DEPLOY_ROOT:-$HOME/deployments/redeemerholding}"
RELEASES="$DEPLOY_ROOT/releases"
SHARED="$DEPLOY_ROOT/shared"
CURRENT="$DEPLOY_ROOT/current"
RELEASE="$RELEASES/$TAG"
REPO_URL="${REPO_URL:-https://github.com/jbwansi/redeemer-holding.git}"
APP_URL="${APP_URL:-https://test.redeemerholding.com}"

ask_yes_no() {
  local message="$1" default="${2:-yes}" prompt answer
  [[ "$default" == "yes" ]] && prompt="[Y/n]" || prompt="[y/N]"
  read -r -p "$message $prompt " answer
  [[ -z "$answer" ]] && [[ "$default" == "yes" ]] && return 0
  case "${answer,,}" in y|yes|o|oui) return 0 ;; *) return 1 ;; esac
}

ok(){ printf '\033[32m[OK]\033[0m %s\n' "$*"; }
warn(){ printf '\033[33m[WARN]\033[0m %s\n' "$*"; }
fail(){ printf '\033[31m[ERREUR]\033[0m %s\n' "$*" >&2; exit 1; }

echo
echo "Redeemer Holding - Déploiement serveur staging"
echo "==============================================="
echo "Release : $TAG"

[[ -x "$PHP_BIN" ]] || fail "PHP introuvable."
"$PHP_BIN" -m | grep -qi '^zip$' || fail "Extension PHP zip absente."
command -v git >/dev/null || fail "git absent."
command -v curl >/dev/null || fail "curl absent."
command -v mysqldump >/dev/null || fail "mysqldump absent."
[[ -f "$SHARED/.env" ]] || fail "shared/.env absent."
[[ -d "$SHARED/storage" ]] || fail "shared/storage absent."

mkdir -p "$SHARED/backups" "$RELEASES"

PREVIOUS=""
[[ -e "$CURRENT" || -L "$CURRENT" ]] && PREVIOUS="$(readlink -f "$CURRENT" || true)"
echo "Release actuelle : ${PREVIOUS:-aucune}"

[[ ! -e "$RELEASE" ]] || fail "$RELEASE existe déjà."

git clone --branch "$TAG" --depth 1 "$REPO_URL" "$RELEASE"
cd "$RELEASE"

[[ "$(git describe --tags --exact-match 2>/dev/null || true)" == "$TAG" ]] || fail "Tag incorrect."
[[ -z "$(git status --porcelain)" ]] || fail "Clone Git non propre."
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
ok "Liens shared créés."

if [[ ! -d vendor ]]; then
  command -v composer >/dev/null || fail "vendor absent et Composer indisponible."
  warn "vendor absent."
  if ask_yes_no "Lancer composer install avec composer.lock ?" "yes"; then
    composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
  else
    fail "vendor absent; arrêt."
  fi
fi

"$PHP_BIN" -r "require 'vendor/autoload.php'; echo 'AUTOLOAD_OK';" | grep -q AUTOLOAD_OK || fail "Autoload PHP invalide."
"$PHP_BIN" artisan about >/dev/null
ok "Laravel démarre."

PENDING="$("$PHP_BIN" artisan migrate:status 2>/dev/null | grep -i 'Pending' || true)"
if [[ -n "$PENDING" ]]; then
  warn "Migration(s) pending:"
  echo "$PENDING"

  ask_yes_no "Créer une sauvegarde MySQL avant migration ?" "yes" || fail "Backup refusé: arrêt."

  TMP_CNF="$(mktemp)"
  chmod 600 "$TMP_CNF"
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

  DB_NAME="$("$PHP_BIN" -r 'require "vendor/autoload.php"; $app=require "bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo config("database.connections.mysql.database");')"
  BACKUP="$SHARED/backups/${DB_NAME}-before-${TAG}-$(date +%Y%m%d-%H%M%S).sql"

  if mysqldump --defaults-extra-file="$TMP_CNF" --single-transaction --routines --triggers "$DB_NAME" > "$BACKUP"; then
    [[ -s "$BACKUP" ]] || fail "Backup vide."
    chmod 600 "$BACKUP"
    ok "Backup créé: $BACKUP"
  else
    rm -f "$TMP_CNF"
    fail "mysqldump a échoué."
  fi
  rm -f "$TMP_CNF"

  if ask_yes_no "Lancer les migrations sur STAGING ?" "no"; then
    "$PHP_BIN" artisan migrate --force
    ok "Migrations appliquées."
  else
    fail "Migration pending non appliquée."
  fi
else
  ok "Aucune migration pending."
fi

echo
echo "Ancien : ${PREVIOUS:-aucun}"
echo "Nouveau: $RELEASE"

if ! ask_yes_no "Basculer current vers $TAG ?" "no"; then
  warn "Release préparée mais non activée."
  exit 0
fi

ln -sfn "$RELEASE" "$CURRENT"
[[ "$(readlink -f "$CURRENT")" == "$RELEASE" ]] || fail "Bascule current échouée."
cd "$CURRENT"
ok "current -> $TAG"

"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache
ok "Caches reconstruits."

smoke(){
  local url="$1" expected="$2" code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || true)"
  echo "$url -> HTTP $code (attendu $expected)"
  [[ "$code" == "$expected" ]]
}

SMOKE_OK=1
smoke "$APP_URL/" "200" || SMOKE_OK=0
smoke "$APP_URL/dashboard" "302" || SMOKE_OK=0
smoke "$APP_URL/dashboard/trainings/import-export" "302" || SMOKE_OK=0

if [[ "$SMOKE_OK" -eq 1 ]]; then
  echo
  echo "DEPLOYMENT OK"
  echo "Release : $TAG"
  echo "HEAD    : $(git rev-parse --short HEAD)"
  exit 0
fi

warn "Smoke test échoué."
if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
  warn "Rollback code seulement: les migrations DB ne seront PAS annulées."
  if ask_yes_no "Revenir au release précédent ?" "yes"; then
    ln -sfn "$PREVIOUS" "$CURRENT"
    cd "$CURRENT"
    "$PHP_BIN" artisan optimize:clear || true
    "$PHP_BIN" artisan config:cache || true
    "$PHP_BIN" artisan route:cache || true
    "$PHP_BIN" artisan view:cache || true
    warn "Code revenu sur $(basename "$PREVIOUS")."
  fi
fi
exit 1
