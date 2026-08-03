# CONIS Studio public routing (W-01A / OF-01)

**Status:** Active  
**Entry:** https://conis.cz/studio

GitHub Pages serves one custom domain (`conis.cz`). The working platform is therefore path-based under `/studio`, not a separate subdomain.

| Surface | URL |
| --- | --- |
| Studio entry / login | https://conis.cz/studio |
| Office Studio | https://conis.cz/studio/office |
| Builder Studio | https://conis.cz/studio/builder |
| Manager Studio | https://conis.cz/studio/manager |
| Sales Studio | https://conis.cz/studio/sales |

Do **not** use `studio.conis.cz`.

Publish:

```bash
pnpm studio:publish
```

Output tree: `docs/studio/{office,builder,manager,sales}/` (+ entry redirect).
