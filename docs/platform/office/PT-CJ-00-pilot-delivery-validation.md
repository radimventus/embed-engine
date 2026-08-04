# PT-CJ-00 — Pilot Delivery Validation Report

**Status:** Ready for Product Review  
**Date:** 2026-08-04  
**Commit strategy:** No commit until Product Review PASS  

---

## Goal

After the sales meeting the merchant one-clicks **Odeslat nabídku**. The partner receives a personalized PDF + login credentials and enters CONIS Studio without help.

---

## Acceptance checklist

| Criterion | Result |
| --- | --- |
| Partner readiness (partner · project · logo · Hero · account · password `conis`) | **PASS** |
| Personalized PDF (Hero + website) | **PASS** |
| Invitation email (exact commercial copy + Login / Heslo / Studio link) | **PASS** |
| SMTP send → Conversation | **PASS** (Mail Session API) |
| IMAP path available | **PASS** (`createEnvMailTransportSession` / operational session) |
| Timeline journal | **PASS** (Conversation projection + Office `pilot.delivered`) |
| Partner logs in without help | **PASS** (`partner@…` / `conis` → AuthShell landing) |
| Commercial Journey itself | Out of scope (entry prepared) |
| Build / typecheck | **PASS** |
| Regressions (PE-07 / PE-10 / Document Runtime) | **PASS** |

---

## One-click flow

1. Obchodník: **Připravit pilot** → account activated with password `conis`, branding (logo/Hero/web).
2. Obchodník: **Odeslat nabídku** → Delivery Preview → confirm.
3. Systém: `pilot_offer` PDF · SMTP invitation · Conversation · Timeline.
4. Partner: e-mail → login → CONIS Studio → ready for Commercial Journey (PT-CJ-01).

---

## Key surfaces

| Area | Path |
| --- | --- |
| Orchestration | `apps/office-studio/src/office/pilotOfferDelivery.ts` |
| UI | `PartnersWorkspacePage` · `PilotDeliveryPreviewDialog` · quick action **Odeslat nabídku** |
| PDF | `@embed-engine/document-runtime` type `pilot_offer` |
| Password | `PILOT_DELIVERY_PASSWORD = 'conis'` |
| Studio link | `resolveCloudLandingHref()` (AuthShell — not invite deep-link) |

---

## Tests

- `pilotOfferDelivery.test.ts` — readiness · PDF · email · SMTP · login
- Updated PE-07 / PE-10 / Document Runtime catalog (7 types)

---

## Product Review

Awaiting PASS before commit:

```
feat(commercial): implement pilot delivery

- automate invitation email
- personalize commercial PDF
- verify SMTP and IMAP delivery
- prepare partner login
- enable commercial journey entry
```

Then push to the working branch.

---

## N+3 — PT-CJ-01 Welcome (concept only)

After PASS: Welcome screen — „Vítejte ve svém CONIS Studio…“ · CTA **Vybrat pilotní program** · secondary **Pokračovat do CONIS Studio**.
