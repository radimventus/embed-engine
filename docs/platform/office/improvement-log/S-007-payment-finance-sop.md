# S-007 — Payment finance SOP

| Field | Value |
| --- | --- |
| ID | S-007 |
| Priority | **2** |
| Oblast | Platba |
| Bariéra | Partner confirms QR payment in UI — no bank pairing. Finance cannot trust first deal from the click alone. |
| Návrh řešení | Temporary manual finance SOP for first pilots. Bank pairing remains out of scope (no new feature in PT-COM-02). |
| Stav | **Verified · SOP** · PT-COM-02 |
| Evidence | Payment Experience (proforma → QR → confirm) · this SOP · PT-CJ-04 |

## Temporary procedure (first external pilots)

Partner-facing path (no salesperson help):

1. Partner completes Commercial Journey → **Dokončit objednávku**.
2. System shows **proforma** (number · amount · due date · company · program).
3. Partner opens **QR** (SPD from proforma) and pays from their bank.
4. Partner may click **Potvrdit provedení QR platby** — UI advances to thank-you / CONIS Studio.  
   **This click is not bank settlement.**

Sales / Finance (required until bank pairing):

5. Within the same business day, check bank statement for matching amount + variable symbol / message from proforma.
6. Only after statement match, treat the deal as **paid** for contracts, onboarding, and pilot kickoff.
7. If UI shows paid but statement missing → contact partner; do not start paid onboarding.
8. Log confirmation (who · when · statement reference) in Pilot Feedback Register / case notes.

## Safe first-sale rule

| Signal | Trust |
| --- | --- |
| QR / “confirm paid” in Offer Experience | Partner progress only |
| Bank statement match | Authoritative for first pilots |
| Bank pairing / auto `PaymentConfirmed` | Not available — later CAP |

## Out of scope (unchanged)

Bank pairing · Business Automation · new payment modules · UX redesign.
