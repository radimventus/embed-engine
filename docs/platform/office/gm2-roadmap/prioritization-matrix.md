# Prioritization Matrix (GM-2)

Estimate scale (internal): **XS** &lt;1d · **S** 1–3d · **M** ~1w · **L** 2–3w · **XL** multi-week / multi-CAP.

Impact: **1** low → **5** high.

| ID | Priority | Business impact | Technical impact | Estimate | Dependencies | Pilot / debt link | Business rationale |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GM2-C01 | Critical | 5 | 5 | XL | — | F-02 | Multi-day deals need durable audit; restart must not erase Conversation/Docs/Tasks |
| GM2-H01 | High | 5 | 4 | L | GM2-C01 (prefer persist ports) | F-01 | Partner checkout on Offer must drive Office docs/mail without silent lag |
| GM2-H02 | High | 4 | 2 | S | — | F-03 | Deliverability is go-live risk; checklist alone is not enough without MX smoke |
| GM2-H03 | High | 5 | 3 | M | — | F-04 | Finance bottleneck is manual; SOP unblocks ops; bank spike informs later CAP |
| GM2-M01 | Medium | 3 | 3 | M | GM2-C01 | F-05 | Pilot Ready must hand structured work to Builder without tribal knowledge |
| GM2-M02 | Medium | 3 | 2 | S | — | F-06 | Operators confuse legacy create UI with Document Runtime SSOT |
| GM2-M03 | Medium | 2 | 2 | S | GM2-H01 (partial) | F-07 | Reduces false “mail missing” escalations when docs are attached |
| GM2-M04 | Medium | 4 | 3 | M | — | F-11 | Contract/proforma presentation affects partner trust |
| GM2-N01 | Nice | 2 | 1 | XS | — | F-08 | Clearer waiting labels for commercial operators |
| GM2-N02 | Nice | 2 | 2 | S | GM2-M02 | Review | Faster supervised resend from task context |
| GM2-N03 | Nice | 2 | 2 | S | GM2-C01 | Review | Weekly pilot review packs without manual copy |

## Priority order (execution sequence)

1. **GM2-C01** — persistence foundation  
2. **GM2-H01** — Automation bus (on durable ports)  
3. **GM2-H02** + **GM2-H03** — production ops (mail · payment) — parallelizable  
4. **GM2-M02** · **GM2-M03** · **GM2-M04** · **GM2-M01** — operator/commercial clarity  
5. **GM2-N01** · **GM2-N02** · **GM2-N03** — polish  

See [CAP Plan](./cap-plan.md) for stage packaging.
