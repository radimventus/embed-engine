# Rollback Procedure — Client Studio

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 |
| **Date** | 2026-07-22 |

---

## When to roll back

| Severity | Example | Action |
| --- | --- | --- |
| Sev-1 | Blank app / ErrorBoundary for all users | Immediate rollback |
| Sev-1 | Runtime bootstrap never completes on pilot host | Immediate rollback |
| Sev-2 | Primary media broken across journey | Rollback or hotfix assets only |
| Sev-3 | Copy / a11y polish | Continue pilot; schedule fix |

Do **not** roll back by enabling Legacy Command Runtime.

---

## Static-host rollback

1. Identify last known-good `dist/` artefact (previous release commit).
2. Redeploy previous artefact to the same origin (same `VITE_BASE`).
3. Purge CDN cache for `index.html` (and optionally hashed assets if mixed).
4. Verify version dataset matches the rolled-back package version.
5. Run Operational Checklist smoke (5 minutes).
6. Notify pilot operator; pause new customer invites until green.

---

## Git-oriented rollback

```bash
git checkout <known-good-sha>
pnpm install --frozen-lockfile
pnpm --filter @embed-engine/client-studio build
# publish apps/client-studio/dist/ via host pipeline
```

Prefer redeploying a stored artefact over rebuilding an old SHA when build tooling has drifted.

---

## After rollback

1. File incident note (URL, version before/after, UTC).
2. Do not ship Runtime changes as emergency Studio fixes.
3. Resume pilot only after Pilot Readiness Checklist re-pass.
