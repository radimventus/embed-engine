# PT-DEPLOY-EMBED-01 — Build & Pages Synchronization Hardening

## Verdict

**Pass.** Embed production publish path now refuses stale IIFE deployment: automatic Runtime fingerprint, post-build Runtime smoke, and `sync:pages` SHA-256 + fingerprint gates.

No Runtime / Provider / Experience / Presentation architecture changes.

---

## Audit — pipeline

```text
Source
  packages/embed/src + Client Studio mount bridge
        ↓
pnpm --filter @embed-engine/embed build
  scripts/build-distribution.mjs
        ↓
Embed IIFE (+ ESM)
  packages/embed/dist/embed.iife.js
  packages/embed/dist/embed.es.js
  packages/embed/dist/version.json   ← fingerprint + hashes
        ↓
pnpm --filter @embed-engine/embed sync:pages
  scripts/sync-pages.mjs
        ↓
docs/embed/   (GitHub Pages /docs)
        ↓
Browser (partner / live.html)
```

### Artifact duality

| Artifact | Produced by | Consumed by |
| --- | --- | --- |
| `dist/embed.iife.js` | Vite IIFE lib build | `sync:pages` → `docs/embed/` → Pages |
| Vite demo (`demo/validate.html`) | `pnpm demo` (TS source) | Local verification only — **not** the Pages IIFE |

---

## Changed scripts

| File | Role |
| --- | --- |
| `scripts/lib/buildFingerprint.mjs` | Fingerprint create/read, SHA-256 helpers |
| `scripts/build-distribution.mjs` | Generate fingerprint before Vite; smoke after |
| `scripts/smoke-runtime.mjs` | Rooms 10, exterior gallery 01–03, Hero, IIFE markers |
| `scripts/sync-pages.mjs` | Hash + fingerprint deploy gate; `?v=<commit>` |
| `scripts/validate-pages.mjs` | Local (+ optional `--remote`) Pages validation |
| `vite.shared.ts` | Inject `__EMBED_RUNTIME_BUILD__` |
| `src/buildFingerprint.ts` | `Embed.build` + console banner on mount |
| `src/Embed.ts` / `src/mount.ts` | Expose/log fingerprint |
| `package.json` | `smoke:runtime`, `validate:pages`, `deploy:pages` |

Docs: `packages/embed/DISTRIBUTION.md`, `docs/releases/GitHub Pages Distribution.md`.

---

## How to verify Pages is current

1. After `deploy:pages`, open `docs/embed/version.json` — note `fingerprint.commit` / `marker` / `iifeSha256`.
2. On mount of Pages IIFE, console must show the same `Build:` commit and Runtime source.
3. After push: `pnpm --filter @embed-engine/embed validate:pages -- --remote`.

---

## Constraints respected

- No Runtime / Provider / Experience / Presentation changes beyond Embed SDK mount logging + `Embed.build`.
- Fingerprint is build-generated only (`.build/fingerprint.json` gitignored).
- Stale or mismatched IIFE cannot pass `sync:pages`.
