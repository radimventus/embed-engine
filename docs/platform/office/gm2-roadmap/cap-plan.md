# GM-2 CAP Plan

Logical implementation stages. Each CAP is reviewable independently.  
No CAP starts without Product Review acceptance.

## CAP-GM2-01 — Persistence Foundation

| Field | Content |
| --- | --- |
| **Goal** | Durable Conversation · Document · Office Task · Workflow sync for commercial projects |
| **Backlog** | GM2-C01 |
| **Business benefit** | Multi-day pilots keep audit trail across restarts; operators trust Office history |
| **Acceptance** | Restart keeps project documents, conversation messages, open tasks, and synced workflow status for the active pilot project |
| **Outcome** | Persistence ports + Office host adapters; no product UX redesign |

## CAP-GM2-02 — Commercial Automation Unification

| Field | Content |
| --- | --- |
| **Goal** | One commercial Automation path from Offer → Office Document/Mail/Tasks/Workflow |
| **Backlog** | GM2-H01 (depends on CAP-GM2-01 preferred) |
| **Business benefit** | Partner checkout immediately visible and actionable in Office without manual replay |
| **Acceptance** | OfferAccepted / OrderConfirmed published from Offer host appear in Office journals and issue documents for the same `projectId` |
| **Outcome** | Shared bus or bridged host; dual-runtime silent lag eliminated |

## CAP-GM2-03 — Production Mail & Payment Operations

| Field | Content |
| --- | --- |
| **Goal** | Production-safe mail cutover + payment confirmation operating model |
| **Backlog** | GM2-H02, GM2-H03 |
| **Business benefit** | Fewer go-live mail failures; finance confirmation is repeatable without tribal knowledge |
| **Acceptance** | Documented MX/SPF/DKIM smoke signed for pilot mailbox; payment SOP published; optional bank-pairing spike report filed |
| **Outcome** | Ops kit + SOP; bank pairing implementation remains optional follow-on |

## CAP-GM2-04 — Document & Operator Clarity

| Field | Content |
| --- | --- |
| **Goal** | Single document SSOT for operators + clearer Timeline/PDF commercial quality |
| **Backlog** | GM2-M02, GM2-M03, GM2-M04 |
| **Business benefit** | Less operator confusion; stronger partner-facing documents |
| **Acceptance** | Legacy OF-04 create path removed or clearly non-SSOT; Timeline distinguishes mail fail vs doc attach; proforma/order PDF meets agreed visual bar |
| **Outcome** | Operator clarity + improved PDF pipeline using deal design assets |

## CAP-GM2-05 — Builder Handoff & Pilot Polish

| Field | Content |
| --- | --- |
| **Goal** | Structured Builder handoff + low-cost pilot polish |
| **Backlog** | GM2-M01, GM2-N01, GM2-N02, GM2-N03 |
| **Business benefit** | Clean exit from Pilot Ready; faster weekly ops |
| **Acceptance** | `waiting_builder` emits handoff payload contract; task labels localized; supervised resend + audit export available |
| **Outcome** | Handoff contract + polish; Builder product implementation remains separate if needed |

## Stage sequence

```text
CAP-GM2-01 Persistence
        ↓
CAP-GM2-02 Automation Unification
        ↓
CAP-GM2-03 Mail & Payment Ops  ← may start in parallel after 01 for H02/H03 docs-only parts
        ↓
CAP-GM2-04 Document Clarity
        ↓
CAP-GM2-05 Builder Handoff & Polish
```
