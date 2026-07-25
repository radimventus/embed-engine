# Playground (SSOT Embed host)

Live Vite host of the **same Runtime** as **Local Runtime** and **Embed Demo** — not a Release Snapshot, not Published Embed.

```bash
pnpm exec vite --config playground/vite.config.ts
```

Opens at `http://127.0.0.1:5185/`.

This host uses `Embed.mount` + Vite SSOT aliases (`packages/*/src`).
It does **not** load `embed.iife.js` (Release Snapshot only, produced by `pnpm embed:publish` into `docs/embed`).

See [ADR-019](../docs/architecture/adr/ADR-019-runtime-vs-release.md) · [embed-release-workflow.md](../docs/architecture/embed-release-workflow.md).
