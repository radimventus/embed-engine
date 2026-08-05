# PT-CJ-03 — Dokončit objednávku (validation)

**Status:** Ready for Product Review · **Commit:** hold until PASS  
**Depends on:** PT-CJ-02 (`1a3b6e7`)

## Screen

One screen · one checkbox · one CTA.

| Block | Content |
| --- | --- |
| Údaje partnera | Společnost · IČ · DIČ · kontakt · e-mail · telefon · adresa · **Upravit údaje** |
| Vybraný program | Pilot / Plus / Max · cena · navazující tarif |
| Smluvní dokumenty | Single checkbox + links: Elektronická objednávka · Rámcová smlouva · Implementační standard · DPA · VOP |
| CTA | Potvrdit objednávku → Platba |

## Out of scope

QR, proforma, Business Automation, SMTP, IMAP.

## Validation

```bash
pnpm --filter @embed-engine/office-studio typecheck
pnpm --filter @embed-engine/office-studio test
pnpm --filter @embed-engine/office-studio build
```

After Product Review **PASS**, prepare commit.
