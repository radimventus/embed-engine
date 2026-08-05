# PT-CJ-04 — Payment Experience (validation)

**Status:** Build PASS · Ready for Product Review · **Commit:** hold until PASS  
**Depends on:** PT-CJ-03 complete order (`6b576a2`)

## Delivered

| Capability | Result |
| --- | --- |
| Proforma náhled | číslo · částka · splatnost · společnost · program |
| Otevřít PDF | blob open |
| Stáhnout PDF | download |
| QR | SPD auto from proforma (`qrcode`) |
| CTA | Potvrdit provedení QR platby → CONIS Studio |
| CONIS Studio | Thank-you + Otevřít CONIS Studio |

## Out of scope

Bank settlement verification, Business Automation, SMTP, IMAP, Office Workflow.

## Validation (PASS)

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

- typecheck PASS  
- tests PASS (117) including `PT-CJ-04 Payment Experience`  
- build PASS  

After Product Review **PASS**, prepare commit (payment experience files only).
