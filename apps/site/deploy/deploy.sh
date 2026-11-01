#!/usr/bin/env bash
# Builds lit.rws8.tech and installs it on the host, then checks it from the
# host itself (the VM can't reach its own public IP).
#   ./deploy.sh [user@host] [ssh port]
# Defaults: ubuntu@168.119.17.57 on port 22. From a machine that can't reach
# the host directly, open a tunnel first and pass ubuntu@127.0.0.1 <port>.
set -euo pipefail
dest="${1:-ubuntu@168.119.17.57}"
port="${2:-22}"
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../../.." && pwd)"
ssh_cmd=(ssh -p "$port" -o BatchMode=yes)

(cd "$repo" && corepack pnpm turbo run build analyze --filter='./packages/*')
(cd "$here/.." && corepack pnpm run build:site)

rsync -az --delete -e "${ssh_cmd[*]}" "$here/install.sh" "$here/enable.sh" "$here/rws-routes.toml" "$here/../dist" "$dest:lit-deploy/"
"${ssh_cmd[@]}" "$dest" 'bash -s' <<'REMOTE'
set -euo pipefail
~/lit-deploy/install.sh
for host in lit.rws8.tech lit.168-119-17-57.sslip.io; do
  if curl -s -o /dev/null --resolve "$host:443:127.0.0.1" -m 10 "https://$host/"; then
    for p in / /components/ /components/button/ /guides/install/ /pagefind/pagefind.js /llms.txt; do
      code=$(curl -s -o /dev/null -w '%{http_code}' --resolve "$host:443:127.0.0.1" -m 20 "https://$host$p")
      echo "$code $host$p"; test "$code" = 200
    done
  else
    echo "skip $host (no certificate for it yet)"
  fi
done
systemctl is-active rws
REMOTE
echo "deployed to $dest"
