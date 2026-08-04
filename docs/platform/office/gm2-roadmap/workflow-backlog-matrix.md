# Workflow × Backlog Matrix (GM-2)

Workflow-driven prioritization: every backlog item is bound to a **Workflow step**, **business goal**, and **Product Area**.

Commercial Workflow reference:

```text
Lead → Offer → Order → Documents → Payment → Conversation → Mail → Timeline → Office → Pilot Ready
```

| ID | Priority | Workflow step(s) | Product Area | Business goal | Pilot finding |
| --- | --- | --- | --- | --- | --- |
| GM2-C01 | Critical | Conversation · Timeline · Office · Documents | Shared Runtime / Persistence | Durable multi-day commercial audit | F-02 |
| GM2-H01 | High | Offer → Order → Documents → Mail | Business Automation | Checkout instantly drives Office work | F-01 |
| GM2-H02 | High | Mail · Lead / Deployment | Mail Session / Ops | Reliable partner deliverability at go-live | F-03 |
| GM2-H03 | High | Payment | Commercial Ops | Repeatable finance confirmation | F-04 |
| GM2-M01 | Medium | Pilot Ready | Builder Handoff | Structured exit from Pilot Ready | F-05 |
| GM2-M02 | Medium | Documents · Office | Office Experience | One document SSOT for operators | F-06 |
| GM2-M03 | Medium | Timeline · Mail | Timeline / Conversation | Clear mail vs document signals | F-07 |
| GM2-M04 | Medium | Documents | Document Runtime | Partner-trustworthy PDF presentation | F-11 |
| GM2-N01 | Nice | Office Tasks | Office Experience | Clearer commercial waiting language | F-08 |
| GM2-N02 | Nice | Office Tasks · Documents | Office Experience | Faster supervised resend | Review |
| GM2-N03 | Nice | Timeline · Office | Ops / Reporting | Weekly pilot review without copy-paste | Review |

## Coverage by Workflow step

| Workflow step | Backlog IDs |
| --- | --- |
| Lead / Deployment | GM2-H02 |
| Offer | GM2-H01 |
| Order | GM2-H01 |
| Documents | GM2-C01, GM2-H01, GM2-M02, GM2-M04, GM2-N02 |
| Payment | GM2-H03 |
| Conversation | GM2-C01 |
| Mail | GM2-H01, GM2-H02, GM2-M03 |
| Timeline | GM2-C01, GM2-M03, GM2-N03 |
| Office / Office Tasks | GM2-C01, GM2-M02, GM2-N01, GM2-N02, GM2-N03 |
| Pilot Ready | GM2-M01 |

Positive-control findings F-09, F-10, F-12 intentionally have **no** backlog rows.
