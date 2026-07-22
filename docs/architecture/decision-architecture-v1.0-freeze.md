# Decision Architecture v1.0 — Status & Freeze

| Field | Value |
| --- | --- |
| **Version** | 1.0 |
| **State** | **ARCHITECTURE FROZEN** |
| **Review** | **PASSED (Conditional)** — [AR-001](./review/AR-001-decision-architecture-v1.md) |
| **Date** | 2026-07-22 |
| **Remaining work** | **Implementation only** |

---

## Meaning of this freeze

Decision Architecture v1.0 is closed as a **foundational generation**.

From this point:

- Do **not** introduce new Product Theses for core Decision Architecture concepts.
- Do **not** redesign Runtime / Interpretation / Experience Context ownership.
- Do **not** add parallel semantic authorities.
- All progress proceeds as **CAPs**, **Engineering Debt (ED-DA-\*)**, or **reference implementation** work.

Conditional Pass acknowledges implementation gaps (Story / Moves / Outcome / Terminal on the session pipeline; Client Studio dual Experience). Those gaps are **authorized work**, not open architecture.

---

## Frozen model

```text
House Package
        ↓
Runtime (commands · events · state)
        ↓
Interpretation (signals · rules · focus)
        ↓
Decision Story          ← CAP-DST-001
        ↓
Decision Moves          ← CAP-DST-002
        ↓
Experience Context
        ↓
Decision Terminal       ← CAP-DTR-001 (surface)
Decision Outcome        ← CAP-OUT-001 (artifact)
```

**Invariants (unchanged without ADR + new AR):**

1. Runtime is the only semantic mutation authority (command-driven).
2. Experience Context is the only presentation semantic contract.
3. AI explains; AI never decides (PT-006).
4. House Package remains passive Object knowledge.
5. Terminal presents Outcome; Outcome is portable truth (PT-007 / PT-008).

---

## Review disposition

| Item | Disposition |
| --- | --- |
| AR-001 | **PASSED (Conditional)** |
| Architecture foundations | **FROZEN** |
| Exit criteria for live Terminal on session pipeline | Tracked via CAP roadmap — not blocking freeze |
| Open questions OQ-01…04 | Resolve during CAP implementation; escalate only if a foundation must change |

---

## Implementation roadmap (frozen order)

1. ~~CAP-DST-001 — Decision Story Engine~~ **Done** (`@embed-engine/runtime` session pipeline)  
2. ~~CAP-DST-002 — Decision Move Engine~~ **Done** (Story → Moves only)  
3. ~~CAP-OUT-001 — Decision Outcome Engine~~ **Done** (Moves → Outcome only)  
4. ~~CAP-DTR-001 — Decision Terminal Engine~~ **Done** (Outcome → Terminal only)  
5. CAP-AI-001 — AI Context Reader  
6. ED-DA-01…06 — boundary hardening  

Full findings: [AR-001](./review/AR-001-decision-architecture-v1.md)  
Debt register: [Engineering Debt](../implementation/Engineering%20Debt.md)

---

## Related freezes

- [Architecture Freeze v0.1](../releases/Architecture%20Freeze%20v0.1.md) — MVP distribution path  
- [Living Experience v0.1](./living-experience-v0.1-freeze.md) — cognitive sync generation  
- [Decision Layer governance v1](./decision-layer/decision-layer-governance-v1.md) — vocabulary governance  

Decision Architecture v1.0 freezes the **Decision Session / Story / Moves / Context / Terminal / Outcome** generation that sits on top of those earlier freezes.
