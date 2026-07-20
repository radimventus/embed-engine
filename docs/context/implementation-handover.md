# Embed Engine – Implementation Handover

## Baseline

| Freeze | Tag / ADR |
| --- | --- |
| Living Experience v0.1 | cognitive sync |
| Decision Layer governance v1 | `architecture-decision-layer-v1` |
| Decision Strategy DT-002 | ADR-010 |

**Vocabulary SSOT (start here):** [`docs/architecture/decision-layer/README.md`](../architecture/decision-layer/README.md)  
**Governance review:** [`decision-layer-governance-v1.md`](../architecture/decision-layer/decision-layer-governance-v1.md)

### Rules

- Extend via Behavior Packs + Decision Layer contracts.  
- Do not redesign the cognitive pipeline without ADR.  
- Do not put Strategy / Move libraries in React.  
- Do not put Decision Terminal in Kernel.  
- Do not embed Story in Interpretation.  
- Do not implement Decision Trajectory (Future Architecture).  
- Do not treat Behavior Pack as a UI modifier.

---

## Canonical stack

```text
Knowledge:      Object Package + Behavior Pack
Kernel:         Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:     Decision Terminal · Priority · FAQ · AI · …
Future:         Decision Trajectory
```

## Next milestone

**DL-01** — Move / Story / Strategy data contracts (no UI). Risks R1–R8 remain open for implementation hosting/transport.

## Workflow

1. Read Decision Layer vocabulary + governance  
2. Extend via Pack / contracts  
3. ADR only if CORE concepts change  
4. Implement → review → commit → push
