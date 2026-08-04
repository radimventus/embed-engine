# PT-CJ-01 — Welcome & Pilot Entry Validation

**Status:** Ready for Product Review  
**Date:** 2026-08-04  
**Commit strategy:** No commit until Product Review PASS  
**Depends on:** PT-CJ-00 (`0d93a5f`)

---

## Goal

After login the partner sees one calm screen and knows the next step is selecting a pilot program.

## Acceptance

| Criterion | Result |
| --- | --- |
| Title: Vítejte ve svém CONIS Studio | **PASS** |
| Lead: Vše je připravené… | **PASS** |
| Password note (Settings) | **PASS** |
| Primary CTA: Vybrat pilotní program → Offer Experience | **PASS** |
| Secondary: Pokračovat do CONIS Studio (quiet link) | **PASS** |
| No marketing / meeting recap / forms / password change | **PASS** |
| Build / tests | **PASS** |

## Surfaces

- `packages/platform-access/src/pilot/welcomeExperience.ts`
- `packages/platform-access/src/react/PartnerWelcomeScreen.tsx`
- `packages/platform-access/src/react/PlatformLanding.tsx`
- `resolvePilotOfferHref()` → local `:4192` / cloud `/offer/`

## Next commit (after PASS)

```
feat(commercial): implement welcome and pilot entry

- redesign welcome experience
- simplify first login flow
- add pilot entry CTA
- preserve optional studio access
```
