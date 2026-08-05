# S-002 — Live SMTP offer delivery

| Field | Value |
| --- | --- |
| ID | S-002 |
| Priority | **1** |
| Oblast | SMTP / Odeslání nabídky |
| Bariéra | Partner Workspace used stub SMTP (`operational.local`). |
| Návrh řešení | `createOfferDeliveryMailSession` → `POST /api/pilot-mail/send` (Nodemailer · SMTP_*). |
| Stav | **Closed** · PT-COM-02 |
| Evidence | `vite/pilotMailRelayPlugin.ts`, `PartnersWorkspacePage.handleConfirmDelivery` |
| Note | Requires SMTP_HOST / SMTP_USER / SMTP_PASSWORD on Office Vite host. |
