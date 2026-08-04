# Operational Findings

First pilot observations (PT-19).  
Each finding is bound to a **Workflow step** and to the GM-2 backlog.

**Rule:** Any undocumented deployment step discovered during the pilot must update the Deployment Package — none were required.

## Legend

| Category | Meaning |
| --- | --- |
| UX | Operator / partner experience friction |
| Ops | Runtime / deploy / mail operations |
| Commercial | Sales / package / contract process |
| Missing | Capability gap vs desired pilot polish |
| Unexpected | Behaviour that surprised operators |

| ID | Workflow step | Category | Finding | Severity | Backlog |
| --- | --- | --- | --- | --- | --- |
| F-01 | Offer → Order | Ops | Offer Experience and Office Automation use **separate** Automation Runtime instances — Offer events do not automatically drive Office Document/Mail journals unless bridged. | High | GM2-H01 |
| F-02 | Conversation / Office / Timeline | Ops | Conversation / Document / Task stores are **in-memory** for Office MVP — process restart loses operational history. | Critical | GM2-C01 |
| F-03 | Mail / Deployment | Ops | Live SMTP/IMAP secrets and DNS/SPF remain operator-owned at cutover; operational adapter succeeds without proving partner MX. | High | GM2-H02 |
| F-04 | Payment | Commercial | Payment is event-driven (`PaymentConfirmed`) — **no bank pairing**; finance confirmation is manual or external. | High | GM2-H03 |
| F-05 | Pilot Ready | Missing | Builder implementation is out of scope — `waiting_builder` is a handoff signal only. | Medium | GM2-M01 |
| F-06 | Documents / Office | UX | Legacy Documents Workspace (OF-04) still coexists with Document Runtime viewer — operators must use project Detail viewer as SSOT. | Medium | GM2-M02 |
| F-07 | Timeline / Mail | Unexpected | Document attach Timeline may show `document.*` journal events without a separate `email.sent` row when mail path fails or is skipped — status still consistent. | Medium | GM2-M03 |
| F-08 | Office Tasks | UX | Office Task labels are generic (`Čeká na odeslání`) — commercial copy could be more partner-facing. | Nice | GM2-N01 |
| F-09 | Order / Documents | Ops | Duplicate `OrderConfirmed` correctly re-versions documents and dedupes open tasks — operators should avoid needless re-publish. | Low (positive control) | — |
| F-10 | Mail / Workflow | Ops | Mail send failure is journaled; Workflow / Tasks / Conversation remain synced (PT-17 failure PASS). | Low (positive control) | — |
| F-11 | Documents | Commercial | Deal package templates are HTML→PDF plain pipeline — visual invoice fidelity is basic vs print design CSS. | Medium | GM2-M04 |
| F-12 | Workflow | Unexpected | Mid-path `WorkflowMessageReceived` does not regress commercial status — good interrupt behaviour. | Low (positive control) | — |

## Findings by Workflow step

| Workflow step | Finding IDs |
| --- | --- |
| Lead / Deployment | F-03 |
| Offer | F-01 |
| Order | F-01, F-09 |
| Documents | F-06, F-09, F-11 |
| Payment | F-04 |
| Conversation | F-02 |
| Mail | F-03, F-07, F-10 |
| Timeline | F-02, F-07 |
| Office / Office Tasks | F-02, F-06, F-08 |
| Workflow | F-10, F-12 |
| Pilot Ready | F-05 |

## Evidence sources

- First pilot commercial flow (`executeFirstPilotCommercialFlow`) — Deployment Package only
- PT-18 package against `p-dse` configuration template
- Architecture observations from Business Automation dual-host wiring
