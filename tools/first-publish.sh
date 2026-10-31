#!/usr/bin/env bash
# First publish of new @lit-material packages. npm trust needs the package to
# exist, so this publishes a 0.0.0-init placeholder (dist-tag `init`, no code),
# trusts release.yml for it, then runs the release workflow, which publishes
# the real version from CI. That publish validates the trust, which npm
# otherwise expires after 48 h. Needs `npm login` and 2FA (one prompt per
# publish and per trust).
#
#   tools/first-publish.sh text-field chart     package directory names
set -euo pipefail
cd "$(dirname "$0")/.."
NPM="npx --yes npm@12.2.1"
[ $# -gt 0 ] || { echo "usage: $0 <package dir>..." >&2; exit 2; }

for dir in "$@"; do
  pkg=$(node -p "require('./packages/$dir/package.json').name")
  if $NPM view "$pkg" name >/dev/null 2>&1; then
    echo "ok   $pkg (already on npm)"
    continue
  fi
  tmp=$(mktemp -d)
  node -e '
    const p = require("./packages/" + process.argv[1] + "/package.json");
    const out = { name: p.name, version: "0.0.0-init", license: p.license,
      description: "Placeholder: real versions are published from CI." };
    require("fs").writeFileSync(process.argv[2] + "/package.json", JSON.stringify(out, null, 2));
  ' "$dir" "$tmp"
  echo "publish $pkg@0.0.0-init"
  (cd "$tmp" && $NPM publish --tag init --access public)
  rm -rf "$tmp"
  # A new package takes a few minutes to show in `npm view`.
  until $NPM view "$pkg" name >/dev/null 2>&1; do sleep 15; done
done

tools/trust-publishing.sh "$@"
gh workflow run release.yml --repo bohdaq/lit-material
echo "release workflow started: it publishes the real versions"
