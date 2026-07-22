# Production Configuration Checklist

| Field | Value |
| --- | --- |
| **Capability** | CSCB-09 |
| **Audience** | Engineers deploying Client Studio pilots |
| **Date** | 2026-07-22 |

---

## Compile-time defaults

| Setting | Production value | Source |
| --- | --- | --- |
| App version | `package.json` → `0.1.0` | Injected as `__CLIENT_STUDIO_VERSION__` |
| Generation | `1` | `productionConfig.ts` |
| Lead mode | `mailto` | `PILOT_FLAGS.leadCaptureMode` |
| Lead mailbox | `kontakt@astav.cz` | `PILOT_LEAD_MAILTO` |
| AI Advisor visible | `true` | `PILOT_FLAGS.showAiAdvisor` |
| Analytics remote export | `false` (memory sink) | `DecisionAnalyticsProvider` |
| Production source maps | `false` | `vite.config.ts` `build.sourcemap` |
| Status bar | hidden | `ClientStudioApp` `showStatusBar={false}` |
| Legacy Command Runtime | **OFF** | Default; must stay off |

---

## Environment variables

| Variable | Required | Production | Notes |
| --- | --- | --- | --- |
| `VITE_BASE` | No | `/` (default) | Set when hosting under a subdirectory |
| `VITE_ENABLE_LEGACY_COMMAND_RUNTIME` | No | **unset / not `true`** | Development-only escape hatch |

No secrets are required for Generation 1 pilot (mailto + memory analytics).

---

## Feature flags

| Flag | Pilot | Rationale |
| --- | --- | --- |
| `showAiAdvisor` | `true` | Surface present; chat is placeholder (Known Limitation) |
| `leadCaptureMode` | `mailto` | No CRM backend in Gen 1 |

Change flags only in `pilotVocabulary.ts` and rebuild — they are not runtime remote config.

---

## Development-only configuration

| Mechanism | Production action |
| --- | --- |
| Vite `import.meta.env.DEV` console analytics | Automatically disabled in production build |
| `?legacyCommandRuntime=1` URL | Forbidden for pilot URLs |
| `localStorage` legacy opt-in | Clear before pilot demos |
| Playwright (devDependency) | Not part of production artefact |

---

## Build configuration

| Item | Expected |
| --- | --- |
| Command | `pnpm --filter @embed-engine/client-studio build` |
| Output | `apps/client-studio/dist/` |
| Source maps | Absent (`.map` files must not ship) |
| Version stamp | `document.documentElement.dataset.clientStudioVersion` |
| Base path | `/` unless `VITE_BASE` set at build time |

---

## Pre-deploy verification

- [ ] Legacy runtime env unset
- [ ] Pilot URL has no `legacyCommandRuntime` query
- [ ] `mailto:` recipient matches operational mailbox
- [ ] Hero / floorplan media present under `public/media/house-modern-01/`
- [ ] Production build completed without errors
- [ ] Preview smoke against `dist/` passed (see Deployment Guide)

---

## Explicitly out of scope (Gen 1)

- Remote feature-flag service
- Secret vault / API keys for CRM or LLM
- CDN cache configuration beyond static SPA hosting
