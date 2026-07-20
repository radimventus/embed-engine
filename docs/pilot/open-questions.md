# CAP-P01 Open Questions

Architecture is frozen. These items are **discovered limitations**.  
**Do not fix here.** Record only.

Vocabulary: [Decision Layer SSOT](../architecture/decision-layer/README.md)  
Risks R1–R8: [Decision Strategy](../architecture/decision-layer/decision-strategy.md)

---

## OQ-P01 — Move completion Signal granularity

**Problem:** Several Moves need an explicit “Move completed” fact, but Living Experience SignalTypes are only `ROOM_VIEWED`, `MEDIA_OPENED`, `FLOOR_CHANGED`, `QUESTION_OPENED`.  

**Impact:** Some completions are overloaded onto `QUESTION_OPENED` or inferred from exploration — ambiguous for Strategy.  

**Recommendation:** Future ADR may add a Move-completion Signal or standardize questionId/moveId payloads. Out of CAP-P01 scope.

---

## OQ-P02 — Story transport to Decision Terminal (R2)

**Problem:** Story is Strategy output, not Interpretation field; Runtime hosting/transport unresolved.  

**Impact:** Terminal cannot yet be wired in code without picking an implementation host (R1/R2).  

**Recommendation:** Resolve in DL-01 data contracts + ADR-008 implementation epic — not by embedding Story in `project()`.

---

## OQ-P03 — Room-level media gap on Pilot Object

**Problem:** Reference fixture has exterior + floorplan; room photo/video sets incomplete.  

**Impact:** Reality-check Moves lean on room ids/floorplan more than visual proof.  

**Recommendation:** CAP-P02 enrich Object Package media; do not fake media in the Behavior Pack.

---

## OQ-P04 — Household-shape capture without DecisionState fields

**Problem:** `layout.ask-household-shape` needs constraints; DecisionState facts/priorities fields are unused in Living Experience reduce today.  

**Impact:** Household answers may only live as Signals/questions until facts are written by reduce.  

**Recommendation:** Keep asking via Signals; product may later map answers into DecisionState.facts via reducer — requires ADR if semantics change.

---

## OQ-P05 — Pack vs prior backlog “Energy Conscious Buyer”

**Problem:** Product backlog listed Energy pack first; CAP-P01 shipped Disposition/Layout instead (higher layout Signal affinity in current Pilot).  

**Impact:** Energy pack still valuable; order changed for product value.  

**Recommendation:** CAP-P03 — Energy Conscious Buyer pack on same Object (after dialogue validation).

---

## OQ-P06 — Dialogue state vs Signal-only cognition (CAP-P02)

**Problem:** The Layout Decision Dialogue needs the system to *remember* household answers and provisional trade-off positions across Moves (e.g. “dining in living accepted”). Today that may only exist as ephemeral Signals / questions.  

**Impact:** Strategy continuation branches that depend on buyer positions are product-clear in `dialogues/layout-dialogue-v1.md` but under-specified in reduce/facts.  

**Recommendation:** Do not redesign architecture here. When implementing, map dialogue positions onto existing DecisionState.facts or Signal payloads — escalate to ADR only if a new aggregate is proposed.

---

## OQ-P07 — Advisor voice ownership (copy vs Pack)

**Problem:** CAP-P02 dialogue includes advisor phrasing. Unclear whether long-form coach language lives in Behavior Pack knowledge, Move metadata, or Experience Terminal copy.  

**Impact:** Risk of UI teams inventing divergent “sales voice.”  

**Recommendation:** Keep meaning and trade-offs in Pack/Moves; treat spoken phrasing as Experience projection of those meanings — no new layer.
