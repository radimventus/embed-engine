# PT-CJ-02 — Pilot Program + Lean Commercial Journey (validation)

**Status:** Ready for Product Review · **Commit:** hold until PASS  
**Depends on:** PT-CJ-OS-01 (`ab2b30d`)

## Lean path

```text
Vítejte → Pilotní program → Dokončit objednávku → Platba → CONIS Studio
```

Internal Office Handoff / Pilot Confirmed are **not** partner steps.

## Delivered

| Step | Screen |
| --- | --- |
| Vítejte | Welcome + CTA → Pilotní program |
| Pilotní program | Pilot · Pilot Plus · Pilot Max (PDF catalog) |
| Dokončit objednávku | Partner · program · contracts · checkboxes · Potvrdit objednávku |
| Platba | Proforma · QR preview · Potvrdit provedení QR platby |
| CONIS Studio | Thank-you + open CONIS Studio |

## Out of scope

Office Handoff UI, Pilot Confirmed step, Business Automation, SMTP, IMAP.

## Validation

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

After Product Review **PASS**, prepare commit.
