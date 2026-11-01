#!/usr/bin/env bash
# Runs ON the host, from a directory holding the site build in ./dist.
# Additive: touches only /var/www/lit (backed up first when it exists).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
ts="$(date +%Y%m%d-%H%M%S)"
test -f "$here/dist/index.html"
if [ -d /var/www/lit ]; then sudo cp -a /var/www/lit "/var/www/lit.bak-$ts"; fi
sudo mkdir -p /var/www/lit
sudo rsync -a --delete "$here/dist/" /var/www/lit/
sudo chown -R root:root /var/www/lit
sudo chmod -R a+rX /var/www/lit
echo "installed $(find /var/www/lit -type f | wc -l) files in /var/www/lit"
