#!/bin/sh
# Install lit.rws8.tech from the rolling "site" release of bohdaq/lit-material:
# lit-site.tar.gz, checked against lit-site.tar.gz.sha256, synced into
# /var/www/lit. Run every 15 minutes by lit-site-update.timer; does nothing
# when the installed commit (/var/www/lit/.release) is current.
# Installed as /usr/local/sbin/lit-site-update.
set -eu
repo=bohdaq/lit-material
root=/var/www/lit
base="https://github.com/$repo/releases/download/site"

commit=$(curl -fsSL "$base/lit-site.commit" | tr -d '[:space:]')
case "$commit" in *[!0-9a-f]*|"") echo "unexpected commit '$commit'" >&2; exit 1;; esac
[ "$(cat "$root/.release" 2>/dev/null)" = "$commit" ] && exit 0

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
curl -fsSL -o "$work/site.tar.gz" "$base/lit-site.tar.gz"
curl -fsSL -o "$work/site.tar.gz.sha256" "$base/lit-site.tar.gz.sha256"
expected=$(cut -d' ' -f1 "$work/site.tar.gz.sha256")
actual=$(sha256sum "$work/site.tar.gz" | cut -d' ' -f1)
[ "$expected" = "$actual" ] || { echo "checksum mismatch for $commit" >&2; exit 1; }

mkdir "$work/site"
tar -xzf "$work/site.tar.gz" -C "$work/site"
[ -f "$work/site/index.html" ] && [ -d "$work/site/components" ] || { echo "archive for $commit has no site" >&2; exit 1; }
mkdir -p "$root"
rsync -a --delete-after --filter="P_/.release" "$work/site/" "$root/"
chown -R root:root "$root"
chmod -R a+rX "$root"
echo "$commit" > "$root/.release"
echo "installed lit.rws8.tech from $commit"
