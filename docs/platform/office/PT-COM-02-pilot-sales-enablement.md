# PT-COM-02 — Remove P0 Sales Barriers

**Status:** Build PASS · Ready for Product Review · **Commit:** hold until PASS  
**Depends on:** PT-COM-01 (`77c9f88`)  
**Date:** 2026-08-05

## Order (binding)

1. **S-002** — production SMTP offer delivery  
2. **S-001** — durable partner identity  
3. **S-003** — personalized offer entry  
4. **S-007** — verify temporary finance SOP (no bank feature)

## Closed / verified

| ID | Result |
| --- | --- |
| S-002 | `createOfferDeliveryMailSession` → `vite/pilotMailRelayPlugin` (`POST /api/pilot-mail/send`, SMTP_*) · fail closed |
| S-001 | `?pilot=` provision snapshot · hydrate on Studio landing · company extras persisted |
| S-003 | Welcome → `resolvePilotOfferHref(offerSlug)` · synthesize partner offer · email includes offer URL |
| S-007 | Temporary finance SOP verified — bank statement is authority until pairing exists |

## Operator notes

- Live send needs `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` on the Office Vite host.
- First pilots: treat Offer Experience “paid” click as progress only; confirm on bank statement ([S-007](./improvement-log/S-007-payment-finance-sop.md)).

## Out of scope

Priority 2/3 (except S-007 verification) · new features · UX changes · refactoring · Business Automation · bank pairing implementation.

## Acceptance (partner path)

New partner receives production email → logs in → opens own CONIS Studio → sees own offer → completes Commercial Journey → completes order → sees payment.  
Salesperson intervention only for temporary finance confirmation (S-007).

## Validation

```bash
pnpm --filter @embed-engine/platform-access test
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
pnpm --filter @embed-engine/offer-experience test
```

After Product Review **PASS**, prepare commit.
