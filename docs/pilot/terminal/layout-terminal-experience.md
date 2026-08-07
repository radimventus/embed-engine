# Decision Terminal — Layout Story Experience (CAP-P01)

**Canonical Terminal definition:** [Decision Layer SSOT](../../architecture/decision-layer/README.md)  
**Modalities:** [experience/decision-terminal.md](../../architecture/experience/decision-terminal.md)

No UI mockups. This describes the **interaction** while Story `story.layout.disposition.v1` is active.

---

## What the user experiences

The Terminal presents the **active Decision Move** as the next guided step in the layout dialogue — not a brochure panel.

### Flow of attention

1. **Confirm** — “We’re deciding disposition — how the house organises life.”  
2. **Discover** — Invites opening living/kitchen, then upstairs rooms (House Navigator / floorplan remain explorers; Terminal narrates why).  
3. **Interpret** — States day/night split in plain language using Object facts.  
4. **Compare** — Asks the living-vs-kitchen and indoor-vs-garden questions out loud.  
5. **Warn** — Names bath contention (and stairs if relevant) before romance wins.  
6. **Ask** — Household shape.  
7. **Recommend** — Fit / conditional / weak fit on layout grounds.

Peer surfaces stay synchronized via Interpretation:

- **Priority** shows layout elevated.  
- **FAQ** offers disposition questions.  
- **AI Advisor** keeps layout conversation context / nextAction.  

Terminal does not replace them; it **renders the Story**.

---

## User actions → Signals

| User action | Typical Signal | Story effect |
| --- | --- | --- |
| Opens living room | `ROOM_VIEWED` | May complete day-zone Move |
| Switches floor | `FLOOR_CHANGED` | Night discover / stairs warn eligibility |
| Opens floorplan | `MEDIA_OPENED` | Interpret eligibility |
| Asks / answers layout question | `QUESTION_OPENED` | Confirm / ask / recommend completion |
| Skips a prompt | Skip → Strategy marks skipped, recomposes | Dialogue continues |

---

## Decision outcome moment

When `layout.recommend-disposition-fit` is active, the Terminal states a clear disposition conclusion and invites the buyer to accept conditions or reject on layout — the product win versus photo browsing.
