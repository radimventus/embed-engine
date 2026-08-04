# GM-2 Success Metrics

Objective criteria for GM-2 decisions. Measure at CAP exit and quarterly pilot review.

## Primary metrics

| ID | Metric | Baseline (GM-1 / first pilot) | GM-2 target | How measured |
| --- | --- | --- | --- | --- |
| M-01 | Partner onboarding time (config → Go) | Guided by checklist; often multi-hour with tribal knowledge | ≤ **90 minutes** for trained operator using Deployment Package only | Timestamp Deployment Checklist start → Go |
| M-02 | Manual interventions per commercial case | Payment + mail cutover + occasional event replay | ≤ **2** documented manual steps (payment confirm + optional supervised resend) | Count interventions logged on case Timeline / findings |
| M-03 | Automation success rate (Offer→Office) | Dual-host risk; may require replay | ≥ **95%** of OfferAccepted/OrderConfirmed auto-reflected in Office without replay | Journal comparison Offer emit vs Office receive |
| M-04 | Commercial process cycle time (OfferAccepted → Pilot Ready) | Validated in smoke; live cases vary | Median ≤ **5 business days** for Starter package once payment confirmed same day | Case timestamps Workflow sync |
| M-05 | Operator / salesman satisfaction (commercial ops) | Qualitative first pilot | ≥ **4/5** average on monthly pulse (clarity of status/tasks/docs) | Short operator survey |
| M-06 | Durable audit retention | In-memory (lost on restart) | **100%** of pilot cases retain Conversation+Docs+Tasks after process restart | Restart drill on staging |
| M-10 | Open Critical backlog items | 1 open (GM2-C01) at GM-2 start | **0** open Critical items at GM-2 exit | Count Critical rows in consolidated backlog |

## Secondary metrics

| ID | Metric | GM-2 target |
| --- | --- | --- |
| M-07 | Mail deliverability incidents at go-live | 0 critical undelivered SYSTEM mails after MX smoke signed |
| M-08 | Document package completeness on OrderConfirmed | 100% electronic-order package (≥5 docs) without manual prepare |
| M-09 | Open Office Task dedupe violations | 0 duplicate open tasks of same kind per project |

## Decision use

- **CAP exit:** related metrics must trend toward target or have explicit waiver.
- **Scope change:** new work requires impact on at least one primary metric.
- **Deferral:** items that do not move M-01…M-06 stay Nice to Have / deferred.
