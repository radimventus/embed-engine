# S-001 — Durable partner identity

| Field | Value |
| --- | --- |
| ID | S-001 |
| Priority | **1** |
| Oblast | Přihlášení / IAM |
| Bariéra | Provisioned user, password and invite live only in the salesperson’s browser (`localStorage` / in-memory registry). Partner cannot log in on their device. |
| Návrh řešení | Persist provisioned users/passwords/invites/company workspace so partner login works cross-device (shared backend or cloud session). |
| Stav | Open · blocks first external sale |
| Evidence | `preparePilotProvisioning.ts`, `userRegistry`, `inviteStore`; PT-COM-01 B-01 |
