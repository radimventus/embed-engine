# S-003 — Personalized offer entry

| Field | Value |
| --- | --- |
| ID | S-003 |
| Priority | **1** |
| Oblast | Commercial Journey / Offer Experience |
| Bariéra | After Welcome, CTA uses `resolvePilotOfferHref()` → Offer Experience seed (`domy-s-energi` / `blokki`). New pilot firm does not get their own purchase path. |
| Návrh řešení | At prepare/deliver, create partner offer slug; Welcome + e-mail open `/offer/{slug}` for that firm. Keep Office CJ five-step path as production preview SSOT where applicable. |
| Stav | Open · blocks first external sale |
| Evidence | `cloudConfig.resolvePilotOfferHref`, `offerRegistry.ts`; PT-COM-01 B-03 |
