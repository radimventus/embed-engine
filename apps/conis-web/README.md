# CONIS Web — development host (DEV-014)

Local host for the **public CONIS website** (`docs/` → https://conis.cz).

Not Studio. Not Embed Demo. Not Client Studio Local Runtime.

## Start

```bash
pnpm web:dev
```

Open: [http://127.0.0.1:4190/](http://127.0.0.1:4190/)

| Surface | URL |
| --- | --- |
| Landing | http://127.0.0.1:4190/ |
| Studio entry | http://127.0.0.1:4190/studio/ |
| Builder | http://127.0.0.1:4190/studio/builder/ |

## Notes

- Serves the GitHub Pages tree (`docs/`) as-is — edit `docs/index.html`, `docs/css/`, `docs/js/` for WEB-2.0 work.
- Lead form still uses the configured Apps Script endpoint (same as production).
- Legacy `conis-web-1.0/` Node server (`:3000`) remains available for qualification API experiments; it is not this host.
