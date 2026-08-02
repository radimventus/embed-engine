# CONIS Studio public routing (W-01A)

**Status:** Active  
**Entry:** https://conis.cz/studio

GitHub Pages serves one custom domain (`conis.cz`). The working platform is therefore path-based under `/studio`, not a separate subdomain.

| Surface | URL |
| --- | --- |
| Studio entry / login | https://conis.cz/studio |
| Builder Studio | https://conis.cz/studio/builder |
| Manager Studio | https://conis.cz/studio/manager |
| Sales Studio | https://conis.cz/studio/sales |
| Office Studio (reserved) | https://conis.cz/studio/office |

Do **not** use `studio.conis.cz`.

Publish:

```bash
pnpm studio:publish
```

Output tree: `docs/studio/{builder,manager,sales}/` (+ entry + office placeholder).
