# GM-2 Prioritized Backlog

Derived from first pilot execution findings ([Operational Findings](./operational-findings.md)).  
No new modules in PT-19 — this backlog scopes **GM-2**.

## Critical

| ID | Item | Rationale (pilot experience) |
| --- | --- | --- |
| GM2-C01 | Persist Conversation · Document · Office Task · Workflow sync stores | In-memory MVP loses audit trail on restart — unacceptable for multi-day pilot cases (F-02). |

## High

| ID | Item | Rationale (pilot experience) |
| --- | --- | --- |
| GM2-H01 | Single commercial Automation bus (Offer ↔ Office) | Dual runtime instances risk silent Office lag when partners checkout on Offer (F-01). |
| GM2-H02 | Production mail cutover kit (DNS/SPF/DKIM + supervised MX smoke) | Operational adapter PASS ≠ partner mailbox deliverability (F-03). |
| GM2-H03 | Payment confirmation SOP + optional bank pairing spike | Finance today is manual event injection (F-04). |

## Medium

| ID | Item | Rationale (pilot experience) |
| --- | --- | --- |
| GM2-M01 | Builder handoff contract (inputs from `waiting_builder`) | Pilot Ready ends in a task with no Builder product (F-05). |
| GM2-M02 | Retire or clearly demote legacy OF-04 Documents Workspace create path | Operators can confuse legacy vs Document Runtime viewer (F-06). |
| GM2-M03 | Timeline clarity when mail fails vs document journal | Reduce operator confusion on missing `email.sent` (F-07). |
| GM2-M04 | Improve proforma / order PDF visual fidelity | Deal CSS exists; plain PDF pipeline under-delivers commercially (F-11). |

## Nice to Have

| ID | Item | Rationale (pilot experience) |
| --- | --- | --- |
| GM2-N01 | Richer Office Task copy (partner-facing Czech labels) | Generic waiting labels work but feel internal (F-08). |
| GM2-N02 | One-click “supervised resend document” from Office Task | Manual Send exists; task-driven resend would speed ops. |
| GM2-N03 | Export pilot case audit pack (Timeline + docs + tasks) | Helpful for weekly pilot reviews. |

## Explicitly deferred (remain out of GM-2 unless re-scoped)

- Full CRM integration
- AI commercial advisor
- Experimental UI redesign
- Architectural rewrites unrelated to pilot findings above
