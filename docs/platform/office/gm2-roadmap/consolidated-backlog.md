# Consolidated Backlog (GM-2)

SSOT backlog for GM-2 after merging:

- GM-1 technical debt (commercial Runtime)
- Pilot findings (PT-19 `F-*`)
- UX findings
- Business findings
- Operations findings

Duplicates removed — one row per outcome.

## Sources → consolidated id

| Source IDs | Consolidated | Note |
| --- | --- | --- |
| F-02 · TD-persist | **GM2-C01** | In-memory commercial stores |
| F-01 · TD-dual-automation | **GM2-H01** | Offer ↔ Office Automation split |
| F-03 · TD-mail-cutover | **GM2-H02** | Production mail readiness |
| F-04 · TD-payment-manual | **GM2-H03** | Payment confirmation gap |
| F-05 | **GM2-M01** | Builder handoff |
| F-06 · TD-of04-docs | **GM2-M02** | Legacy Documents Workspace |
| F-07 | **GM2-M03** | Timeline mail clarity |
| F-11 | **GM2-M04** | PDF visual fidelity |
| F-08 | **GM2-N01** | Task copy |
| Pilot review N02 | **GM2-N02** | Task-driven resend |
| Pilot review N03 | **GM2-N03** | Audit export pack |
| F-09, F-10, F-12 | — | Positive controls — no backlog |

## Active backlog

| ID | Title | Origin buckets | Pilot finding |
| --- | --- | --- | --- |
| GM2-C01 | Persist Conversation · Document · Task · Workflow sync | Ops · GM-1 debt | F-02 |
| GM2-H01 | Single commercial Automation bus (Offer ↔ Office) | Ops · GM-1 debt | F-01 |
| GM2-H02 | Production mail cutover kit (DNS/SPF/DKIM + MX smoke) | Ops | F-03 |
| GM2-H03 | Payment confirmation SOP (+ optional bank pairing spike) | Business · Ops | F-04 |
| GM2-M01 | Builder handoff contract from `waiting_builder` | Missing · Business | F-05 |
| GM2-M02 | Demote/retire legacy OF-04 document create path | UX · GM-1 debt | F-06 |
| GM2-M03 | Timeline clarity for mail fail vs document journal | UX · Unexpected | F-07 |
| GM2-M04 | Proforma / order PDF visual fidelity | Business · Commercial | F-11 |
| GM2-N01 | Partner-facing Office Task Czech labels | UX | F-08 |
| GM2-N02 | Supervised resend document from Office Task | Ops · UX | Review |
| GM2-N03 | Export pilot case audit pack | Ops | Review |

## Explicitly deferred (not in GM-2 active backlog)

| Item | Why deferred |
| --- | --- |
| Full CRM integration | Out of pilot scope; no blocking F-* |
| AI commercial advisor | Explicitly out of GM-1/PT scope |
| Experimental UI redesign | Not required to finish commercial path |
| Broad architectural rewrites | Only targeted debt above enters GM-2 |

## Dedup log

| Removed as duplicate of | Was |
| --- | --- |
| GM2-C01 | “Add database for Office conversations” (same outcome as persist stores) |
| GM2-H01 | “Wire Offer checkout to Office host” (same as Automation bus) |
| GM2-M02 | “Hide Documents Quick Actions create” (subset of OF-04 demotion) |
