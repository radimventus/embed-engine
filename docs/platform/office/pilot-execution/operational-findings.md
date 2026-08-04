# Operational Findings

First pilot observations (PT-19). Each item is backlog-bound — see [GM-2 Prioritized Backlog](./gm2-prioritized-backlog.md).

## Legend

| Category | Meaning |
| --- | --- |
| UX | Operator / partner experience friction |
| Ops | Runtime / deploy / mail operations |
| Commercial | Sales / package / contract process |
| Missing | Capability gap vs desired pilot polish |
| Unexpected | Behaviour that surprised operators |

| ID | Category | Finding | Severity | Backlog |
| --- | --- | --- | --- | --- |
| F-01 | Ops | Offer Experience and Office Automation use **separate** Automation Runtime instances — Offer events do not automatically drive Office Document/Mail journals unless bridged. | High | GM2-H01 |
| F-02 | Ops | Conversation / Document / Task stores are **in-memory** for Office MVP — process restart loses operational history. | Critical | GM2-C01 |
| F-03 | Ops | Live SMTP/IMAP secrets and DNS/SPF remain operator-owned at cutover; operational adapter succeeds without proving partner MX. | High | GM2-H02 |
| F-04 | Commercial | Payment is event-driven (`PaymentConfirmed`) — **no bank pairing**; finance confirmation is manual or external. | High | GM2-H03 |
| F-05 | Missing | Builder implementation is out of scope — `waiting_builder` is a handoff signal only. | Medium | GM2-M01 |
| F-06 | UX | Legacy Documents Workspace (OF-04) still coexists with Document Runtime viewer — operators must use project Detail viewer as SSOT. | Medium | GM2-M02 |
| F-07 | Unexpected | Document attach Timeline may show `document.*` journal events without a separate `email.sent` row when mail path fails or is skipped — status still consistent. | Medium | GM2-M03 |
| F-08 | UX | Office Task labels are generic (`Čeká na odeslání`) — commercial copy could be more partner-facing. | Nice | GM2-N01 |
| F-09 | Ops | Duplicate `OrderConfirmed` correctly re-versions documents and dedupes open tasks — operators should avoid needless re-publish. | Low (positive control) | — |
| F-10 | Ops | Mail send failure is journaled; Workflow / Tasks / Conversation remain synced (PT-17 failure PASS). | Low (positive control) | — |
| F-11 | Commercial | Deal package templates are HTML→PDF plain pipeline — visual invoice fidelity is basic vs print design CSS. | Medium | GM2-M04 |
| F-12 | Unexpected | Mid-path `WorkflowMessageReceived` does not regress commercial status — good interrupt behaviour. | Low (positive control) | — |

## Evidence sources

- Controlled commercial lifecycle (`executeFirstPilotCommercialFlow` / PT-17 readiness suite)
- PT-18 Deployment Package dry-run against `p-dse` configuration template
- Architecture observations from Business Automation dual-host wiring
