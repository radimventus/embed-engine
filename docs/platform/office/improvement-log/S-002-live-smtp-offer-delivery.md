# S-002 — Live SMTP offer delivery

| Field | Value |
| --- | --- |
| ID | S-002 |
| Priority | **1** |
| Oblast | SMTP / Odeslání nabídky |
| Bariéra | Partner Workspace `Odeslat nabídku` calls `createPilotMailSession()` (browser stub, `operational.local`). UI reports success; partner mailbox stays empty. |
| Návrh řešení | Wire confirm delivery to live SMTP (`createEnvMailTransportSession` or mail relay). Stub only in tests. Do not report success unless MTA accepts the message. |
| Stav | Open · blocks first external sale |
| Evidence | `PartnersWorkspacePage.handleConfirmDelivery`, `createPilotMailSession.ts`; PT-COM-01 B-02; operational F-03 |
