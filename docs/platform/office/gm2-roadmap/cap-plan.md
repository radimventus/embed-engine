# GM-2 CAP Plan

Logical implementation stages with explicit order.  
No CAP starts without Product Review acceptance.

Estimate scale: **XS** &lt;1d · **S** 1–3d · **M** ~1w · **L** 2–3w · **XL** multi-week.

## Implementation order

1. CAP-GM2-01  
2. CAP-GM2-02  
3. CAP-GM2-03 (docs/SOP tracks may start after 01)  
4. CAP-GM2-04  
5. CAP-GM2-05  

---

## CAP-GM2-01 — Persistence Foundation

| Field | Content |
| --- | --- |
| **Goal** | Durable Conversation · Document · Office Task · Workflow sync for commercial projects |
| **Business benefit** | Multi-day pilots keep audit trail across restarts; operators trust Office history |
| **Technical scope** | Persistence ports for Conversation mail store, Document version store, Office Task registry, commercialWorkflowSync overlay; Office host adapters; restart drill tests — **no** UX redesign |
| **Backlog** | GM2-C01 |
| **Estimate** | XL |
| **Dependencies** | — |
| **Acceptance** | Restart keeps project documents, conversation messages, open tasks, and synced workflow status for the active pilot project |
| **Outcome** | Durable commercial state foundation |

## CAP-GM2-02 — Commercial Automation Unification

| Field | Content |
| --- | --- |
| **Goal** | One commercial Automation path from Offer → Office Document/Mail/Tasks/Workflow |
| **Business benefit** | Partner checkout immediately visible and actionable in Office without manual replay |
| **Technical scope** | Shared Automation bus or Offer→Office bridge; single projectId correlation; eliminate dual-runtime silent lag — **no** new business event kinds unless required |
| **Backlog** | GM2-H01 |
| **Estimate** | L |
| **Dependencies** | CAP-GM2-01 preferred (persist ports) |
| **Acceptance** | OfferAccepted / OrderConfirmed from Offer host appear in Office journals and issue documents for the same `projectId` |
| **Outcome** | Continuous Offer↔Office automation |

## CAP-GM2-03 — Production Mail & Payment Operations

| Field | Content |
| --- | --- |
| **Goal** | Production-safe mail cutover + payment confirmation operating model |
| **Business benefit** | Fewer go-live mail failures; finance confirmation is repeatable |
| **Technical scope** | MX/SPF/DKIM smoke kit in Deployment Package; payment confirmation SOP; optional bank-pairing **spike report** only |
| **Backlog** | GM2-H02, GM2-H03 |
| **Estimate** | M (combined; H02≈S, H03≈M) |
| **Dependencies** | — (docs tracks); live mail secrets ops |
| **Acceptance** | MX smoke signed for pilot mailbox; payment SOP published; bank spike filed or explicitly deferred |
| **Outcome** | Production ops kit |

## CAP-GM2-04 — Document & Operator Clarity

| Field | Content |
| --- | --- |
| **Goal** | Single document SSOT + clearer Timeline + commercial PDF quality |
| **Business benefit** | Less operator confusion; stronger partner-facing documents |
| **Technical scope** | Demote/retire OF-04 create path; Timeline mail-fail vs doc-attach clarity; PDF pipeline using deal design assets |
| **Backlog** | GM2-M02, GM2-M03, GM2-M04 |
| **Estimate** | M–L |
| **Dependencies** | CAP-GM2-02 partial for M03 |
| **Acceptance** | Legacy create path non-SSOT; Timeline distinguishes mail fail vs doc attach; proforma/order PDF meets agreed visual bar |
| **Outcome** | Operator + document clarity |

## CAP-GM2-05 — Builder Handoff & Pilot Polish

| Field | Content |
| --- | --- |
| **Goal** | Structured Builder handoff + low-cost pilot polish |
| **Business benefit** | Clean exit from Pilot Ready; faster weekly ops |
| **Technical scope** | `waiting_builder` handoff payload contract; Czech task labels; supervised resend from task; audit export pack — **not** full Builder Studio |
| **Backlog** | GM2-M01, GM2-N01, GM2-N02, GM2-N03 |
| **Estimate** | M |
| **Dependencies** | CAP-GM2-01 for N03; CAP-GM2-04 preferred for N02 |
| **Acceptance** | Handoff payload emitted; labels localized; supervised resend + audit export available |
| **Outcome** | Handoff + polish |

## Stage sequence

```text
CAP-GM2-01 Persistence
        ↓
CAP-GM2-02 Automation Unification
        ↓
CAP-GM2-03 Mail & Payment Ops
        ↓
CAP-GM2-04 Document Clarity
        ↓
CAP-GM2-05 Builder Handoff & Polish
```
