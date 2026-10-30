#!/usr/bin/env bash
# Trust .github/workflows/release.yml to publish every @lit-material package
# (npm trusted publishing). Run once, logged in to npm as an owner of the
# packages: `npm login` first. npm asks for 2FA approval per change.
# New packages: run again after their first publish (a package must exist on
# npm before it can trust a workflow); existing trusts are skipped.
#
#   tools/trust-publishing.sh            all packages
#   tools/trust-publishing.sh chart      one package (by directory name)
set -euo pipefail
cd "$(dirname "$0")/.."
NPM="npx --yes npm@12.2.1"
REPO="bohdaq/lit-material"
FILE="release.yml"

dirs=("$@")
[ ${#dirs[@]} -gt 0 ] || mapfile -t dirs < <(ls packages)

for dir in "${dirs[@]}"; do
  pkg=$(node -p "require('./packages/$dir/package.json').name")
  private=$(node -p "Boolean(require('./packages/$dir/package.json').private)")
  [ "$private" = "true" ] && { echo "skip $pkg (private)"; continue; }
  if ! $NPM view "$pkg" version >/dev/null 2>&1; then
    echo "skip $pkg (not on npm yet: publish it once, then run this again)"
    continue
  fi
  if $NPM trust list "$pkg" 2>/dev/null | grep -q "$REPO"; then
    echo "ok   $pkg (already trusted)"
    continue
  fi
  echo "trust $pkg"
  $NPM trust github "$pkg" --repo "$REPO" --file "$FILE" --allow-publish --yes
done
