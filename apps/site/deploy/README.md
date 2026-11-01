# lit.rws8.tech host files

The site is static: `pnpm build` in `apps/site` writes `dist/`, which the front
rws on bohdan-prod-donotdelete serves from `/var/www/lit` with a `static` route.

| File | What it does |
| --- | --- |
| `deploy.sh [user@host] [port]` | Builds the packages and the site, copies `dist/` to the host, runs `install.sh`, checks the pages |
| `install.sh` | On the host: backs up `/var/www/lit`, installs the new `dist/` there |
| `rws-routes.toml` | The two routes added once to `/etc/rws/rws.config.toml` |

## One-time setup (owner)

1. Add the routes in `rws-routes.toml` to `/etc/rws/rws.config.toml` above the
   `old-docs-*` routes, and `"lit.168-119-17-57.sslip.io"` to `[acme] domains`.
   Back the file up, `rws --check=` it, restart rws (see the command block in the
   lit-material session notes for the certificate step).
2. Install the files: `./deploy.sh ubuntu@127.0.0.1 <tunnel port>`.
3. Add a DNS A record `lit.rws8.tech → 168.119.17.57`, then append
   `"lit.rws8.tech"` to `[acme] domains` the same way.
4. Point the old GitHub Pages docs at the new site: `.github/workflows/deploy-docs.yml`
   then publishes a redirect page instead of the old docs.
