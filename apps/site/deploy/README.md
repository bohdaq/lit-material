# lit.rws8.tech host files

The site is static: `pnpm build` in `apps/site` writes `dist/`, which the front
rws on bohdan-prod-donotdelete serves from `/var/www/lit` with a `static` route.

| File | What it does |
| --- | --- |
| `deploy.sh [user@host] [port]` | Builds the packages and the site, copies `dist/` to the host, runs `install.sh`, checks the pages |
| `install.sh` | On the host: backs up `/var/www/lit`, installs the new `dist/` there |
| `rws-routes.toml` | The two routes added once to `/etc/rws/rws.config.toml` |
| `lit-site-update.sh`, `.service`, `.timer` | Auto deploy: every 15 minutes the VM installs the newest build from the `site` GitHub release, which `.github/workflows/site.yml` replaces on every push to main |
| `lit-docs-mcp.service`, `rws-mcp-route.toml` | The docs MCP server at `lit.rws8.tech/mcp`: a second instance of rws8.tech's `rws-docs-mcp` binary on `127.0.0.1:7891`, reading the index the build writes to `dist/mcp/` (`scripts/mcp-index.mjs`), and its route (above `lit-site`) |
| `enable.sh` | On the host, as root: adds the routes and the site's names to the shared certificate, checks every site and mail, rolls back on failure |

## One-time setup (owner)

1. Add a DNS A record `lit.rws8.tech → 168.119.17.57`.
2. `./deploy.sh ubuntu@127.0.0.1 <tunnel port>` copies the files (and this folder) to `~/lit-deploy`.
3. On the host: `sudo bash ~/lit-deploy/enable.sh`. Without the DNS record it adds only
   `lit.168-119-17-57.sslip.io`; run it again once the record resolves.
4. Point the old GitHub Pages docs at the new site (`.github/workflows/deploy-docs.yml`
   then publishes a redirect page instead of the old docs).

## Auto deploy (once, owner)

```sh
sudo install -m 0755 lit-site-update.sh /usr/local/sbin/lit-site-update
sudo install -m 0644 lit-site-update.service lit-site-update.timer /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now lit-site-update.timer
sudo systemctl start lit-site-update.service && journalctl -u lit-site-update -n 5 --no-pager
```

After that, a push to main reaches lit.rws8.tech within about 15 minutes; `deploy.sh` stays for a
deploy by hand. `/var/www/lit/.release` holds the installed commit.

## Docs MCP server (once, owner)

Needs `/usr/local/bin/rws-docs-mcp` (installed for rws8.tech by `rws-site-update`) and a site build
with `/var/www/lit/mcp/index.json`. Insert `rws-mcp-route.toml` into `/etc/rws/rws.config.toml` above
the `[[route]]` named `lit-site`, then:

```sh
sudo install -m 0644 lit-docs-mcp.service /etc/systemd/system/
sudo install -m 0755 lit-site-update.sh /usr/local/sbin/lit-site-update   # restarts it after each install
sudo systemctl daemon-reload && sudo systemctl enable --now lit-docs-mcp.service
sudo sh -c 'set -a; . /etc/rws/admin.env; /usr/local/bin/rws --check=/etc/rws/rws.config.toml' && sudo systemctl restart rws
```
