#!/usr/bin/env bash
# One-time setup on bohdan-prod-donotdelete, run as root from ~/lit-deploy:
#   sudo bash ~/lit-deploy/enable.sh
# Adds the lit.rws8.tech routes (rws-routes.toml) and the site's names to the
# shared certificate, checks everything, and rolls back on any failure.
# lit.rws8.tech is added only once its DNS A record points at this VM; run the
# script again after adding the record (it skips what is already in place).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
C=/etc/rws/rws.config.toml
CERT=/var/lib/rws/cert.pem
KEY=/var/lib/rws/key.pem
ts="$(date +%Y%m%d-%H%M%S)"
IP=168.119.17.57

names=("lit.168-119-17-57.sslip.io")
if getent ahostsv4 lit.rws8.tech | grep -q "$IP"; then
  names+=("lit.rws8.tech")
else
  echo "note: lit.rws8.tech doesn't resolve to $IP yet; adding only the staging name"
fi

test -f "$C" && test -f "$CERT" && test -f "$KEY" && test -d /var/www/lit
cp -a "$C" "$C.bak-lit-$ts"
echo "config backed up to $C.bak-lit-$ts"

# Insert the routes above the first old-docs-* route, add missing names to
# [acme] domains. Prints the names it added.
added=$(python3 - "$C" "$here/rws-routes.toml" "${names[@]}" <<'PY'
import re, sys
path, snippet_path, *names = sys.argv[1:]
text = open(path).read()
snippet = open(snippet_path).read()
if 'name = "lit-site"' not in text:
    lines = text.split("\n")
    old = next((i for i, l in enumerate(lines) if re.match(r'\s*name\s*=\s*"old-docs', l)), None)
    if old is None:
        sys.exit("no old-docs route found to insert above")
    start = max(i for i in range(old) if lines[i].strip() == "[[route]]")
    lines[start:start] = [snippet.rstrip("\n"), ""]
    text = "\n".join(lines)
m = re.search(r'^(domains\s*=\s*\[)([^\]]*)\]', text, re.M)
if not m:
    sys.exit("no [acme] domains line found")
current = re.findall(r'"([^"]+)"', m.group(2))
new = [n for n in names if n not in current]
if new:
    items = ", ".join(f'"{d}"' for d in current + new)
    text = text[: m.start()] + f"{m.group(1)}{items}]" + text[m.end():]
open(path, "w").write(text)
print(" ".join(new))
PY
)

restore_config() {
  cp -a "$C.bak-lit-$ts" "$C"
  echo "config restored from $C.bak-lit-$ts"
}

set -a; . /etc/rws/admin.env; set +a
if ! /usr/local/bin/rws --check="$C"; then
  restore_config
  exit 1
fi

if [ -z "$added" ]; then
  echo "certificate names already in place"
  systemctl restart rws
else
  echo "adding to the certificate: $added"
  # rws keeps a certificate that doesn't cover a new name: move it aside so it
  # orders a new one. Mail reads the same file, so hold its reload meanwhile.
  systemctl stop rws-mail-cert.path
  cp -a "$CERT" "$CERT.bak-lit-$ts"
  cp -a "$KEY" "$KEY.bak-lit-$ts"
  mv "$CERT" "$CERT.old-lit-$ts"
  systemctl restart rws
  ok=""
  for _ in $(seq 1 60); do
    sleep 3
    if [ -f "$CERT" ] && openssl x509 -in "$CERT" -noout -ext subjectAltName 2>/dev/null | grep -q "${names[0]}"; then ok=1; break; fi
  done
  if [ -z "$ok" ]; then
    echo "no new certificate after 3 minutes: rolling back"
    restore_config
    cp -a "$CERT.bak-lit-$ts" "$CERT"
    cp -a "$KEY.bak-lit-$ts" "$KEY"
    systemctl restart rws
    systemctl start rws-mail-cert.path
    exit 1
  fi
  systemctl start rws-mail-cert.path
  systemctl start rws-mail-cert.service
  echo "new certificate: $(openssl x509 -in "$CERT" -noout -ext subjectAltName | tail -1 | tr -d ' ')"
fi

sleep 2
fail=""
for host in rws8.tech git.rws8.tech hitop.rws8.tech "${names[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --resolve "$host:443:127.0.0.1" -m 20 "https://$host/" || true)
  echo "$code https://$host/"
  [ "$code" = 200 ] || fail=1
done
if echo | openssl s_client -connect 127.0.0.1:465 -servername mail.rws8.tech 2>/dev/null | openssl x509 -noout -checkend 86400 >/dev/null; then
  echo "mail certificate ok"
else
  echo "mail certificate check failed"; fail=1
fi
systemctl is-active rws
if [ -n "$fail" ]; then
  if [ -n "$added" ]; then
    echo "a check failed: roll back with  cp $C.bak-lit-$ts $C && cp $CERT.bak-lit-$ts $CERT && cp $KEY.bak-lit-$ts $KEY && systemctl restart rws"
  else
    echo "a check failed: roll back with  cp $C.bak-lit-$ts $C && systemctl restart rws"
  fi
  exit 1
fi
echo "lit.rws8.tech setup done"
