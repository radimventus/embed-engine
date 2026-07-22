# Pilot Readiness Checklist

**Required before every external pilot deployment.**

Product: Client Studio Generation 1 · Capability: CSCB-09 · Date: ________

Pilot URL: ________  
Release commit / version: ________

---

## 1. Runtime

- [ ] Certified Runtime path only (no Legacy Command Runtime)
- [ ] Bootstrap completes (`Připravuji Decision Session…` → journey)
- [ ] Decision Session updates when priorities / moves change
- [ ] No Studio-side semantic reinterpretation observed
- [ ] No duplicated Runtime state in UI providers

## 2. Media

- [ ] Hero primary media loads **or** graceful Czech fallback
- [ ] Floor plan asset available
- [ ] Spatial / walkthrough photo mode never renders video URL as `<img>`
- [ ] Media load failure shows fallback (journey continues)
- [ ] Lightbox open/close works (Escape closes)

## 3. AI

- [ ] AI Advisor visibility matches pilot policy (`showAiAdvisor`)
- [ ] FAQ / intro content projects Runtime AIContext only
- [ ] Chat placeholder behaviour understood by operator
- [ ] AI failure / stub does not terminate Decision Journey

## 4. Analytics

- [ ] Analytics provider mounts without UI errors
- [ ] Export failures cannot break journey (memory / resilient adapters)
- [ ] Production host does not require remote analytics to function
- [ ] Events exclude prompt/response bodies and form PII

## 5. Conversion

- [ ] CTA → form → consent gate works
- [ ] Mailto opens with expected recipient **or** graceful error + fallback copy
- [ ] Runtime context strip is display-only
- [ ] Cancel path does not leave broken UI state

## 6. Accessibility

- [ ] Keyboard: sidebar / header shortcuts reach sections
- [ ] Focus visible on primary controls
- [ ] Form fields have accessible names
- [ ] Terminal pending state announced (`aria-busy` / status)
- [ ] Remaining a11y findings reviewed (non-blocking OK)

## 7. Performance

- [ ] First interactive journey acceptable on pilot laptop / mid phone
- [ ] Section navigation feels responsive (no multi-second freezes)
- [ ] No empty screens during bootstrap / media pending
- [ ] No intentional premature optimisations blocking ship

## 8. Deployment

- [ ] Clean install + production build verified
- [ ] Preview or staging smoke passed
- [ ] Asset integrity (media + house-package) on live host
- [ ] Source maps absent on pilot host
- [ ] Version visible via `dataset.clientStudioVersion`
- [ ] Rollback owner identified
- [ ] [Operational Checklist](./OPERATIONAL-CHECKLIST.md) complete
- [ ] [Known Limitations](./KNOWN-LIMITATIONS.md) acknowledged by operator

---

## Sign-off

| Role | Name | Signature / date |
| --- | --- | --- |
| Engineering | | |
| Pilot operator | | |
| (Optional) Product | | |

**Result:** ☐ Ready for external pilot · ☐ Blocked (reason: ________)
