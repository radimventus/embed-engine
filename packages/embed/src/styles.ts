/**
 * Default Embed styles (scoped under .embed-root).
 * Injected on mount so IIFE works without a separate CSS file.
 */

export const EMBED_STYLES = `
.embed-root {
  --embed-bg: #e8f0ea;
  --embed-bg-deep: #d5e4da;
  --embed-ink: #1c2b22;
  --embed-muted: #4a5c52;
  --embed-panel: #f7fbf8;
  --embed-line: #b7c9be;
  --embed-accent: #2f6b4f;
  --embed-accent-ink: #f4faf6;
  --embed-warn: #8a3b2d;
  --embed-ok: #1f5c3d;
  --embed-shadow: 0 18px 50px rgba(28, 43, 34, 0.08);
  --embed-font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --embed-font-body: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;

  box-sizing: border-box;
  color: var(--embed-ink);
  font-family: var(--embed-font-body);
  width: min(920px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  background:
    radial-gradient(900px 480px at 10% -10%, #f4fff7 0%, transparent 55%),
    linear-gradient(160deg, var(--embed-bg) 0%, var(--embed-bg-deep) 100%);
  border-radius: 1.25rem;
}

.embed-root *,
.embed-root *::before,
.embed-root *::after {
  box-sizing: border-box;
}

.embed-root .hero { margin-bottom: 1.75rem; }
.embed-root .brand {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .hero h1 {
  margin: 0;
  font-family: var(--embed-font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.15;
  font-weight: 600;
}
.embed-root .hero__sub {
  margin: 0.75rem 0 0;
  color: var(--embed-muted);
  max-width: 38rem;
}
.embed-root .stage-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
}
.embed-root .stage-rail__item {
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--embed-line);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--embed-muted);
  background: rgba(247, 251, 248, 0.7);
}
.embed-root .stage-rail__item.is-active {
  color: var(--embed-accent-ink);
  background: var(--embed-accent);
  border-color: var(--embed-accent);
}
.embed-root .banner {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin: 0 0 1rem;
}
.embed-root .banner--error {
  background: #f8e8e4;
  color: var(--embed-warn);
}
.embed-root .banner--ok {
  background: #dff0e6;
  color: var(--embed-ok);
}
.embed-root .panel {
  background: var(--embed-panel);
  border: 1px solid var(--embed-line);
  border-radius: 1.25rem;
  padding: 1.5rem 1.6rem 1.7rem;
  box-shadow: var(--embed-shadow);
}
.embed-root .panel--wide { padding-bottom: 1.9rem; }
.embed-root .eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--embed-accent);
  font-weight: 700;
}
.embed-root .panel h2,
.embed-root .experience-header h2 {
  margin: 0 0 0.65rem;
  font-family: var(--embed-font-display);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 600;
}
.embed-root .lede,
.embed-root .body {
  margin: 0 0 1.25rem;
  color: var(--embed-muted);
  line-height: 1.55;
  white-space: pre-wrap;
}
.embed-root .confidence {
  margin: 0 0 1.25rem;
  color: var(--embed-ink);
  line-height: 1.5;
  font-size: 0.95rem;
}
.embed-root .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.embed-root .actions--wrap { margin-top: 0.35rem; }
.embed-root .btn {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.7rem 1.15rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.embed-root .btn-primary {
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
}
.embed-root .btn-secondary {
  background: #eef6f1;
  color: var(--embed-accent);
  border-color: var(--embed-line);
}
.embed-root .btn-ghost {
  background: transparent;
  color: var(--embed-muted);
  border-color: var(--embed-line);
}
.embed-root .btn:hover { filter: brightness(0.97); }
.embed-root .experience-grid {
  display: grid;
  gap: 1.1rem;
  margin-bottom: 1.35rem;
}
@media (min-width: 720px) {
  .embed-root .experience-grid { grid-template-columns: 1fr 1fr; }
}
.embed-root .experience-grid h3,
.embed-root .panel h3 {
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--embed-accent);
}
.embed-root .experience-grid ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--embed-muted);
}
.embed-root .claim {
  margin: 0 0 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.85rem;
  background: #eef5f0;
}
.embed-root .claim--concern { background: #f4eee8; }
.embed-root .claim h3 {
  margin: 0 0 0.35rem;
  text-transform: none;
  letter-spacing: 0;
  font-size: 1rem;
  color: var(--embed-ink);
}
.embed-root .claim p {
  margin: 0;
  color: var(--embed-muted);
  line-height: 1.45;
}
.embed-root .mapping-list {
  list-style: none;
  margin: 0 0 1.4rem;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.embed-root .mapping-item {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #eef5f0;
  border: 1px solid var(--embed-line);
}
.embed-root .mapping-item__anchor {
  margin: 0 0 0.35rem;
  font-weight: 600;
}
.embed-root .mapping-item__why,
.embed-root .mapping-item__claim {
  margin: 0;
  color: var(--embed-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}
.embed-root .mapping-item__claim {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}
.embed-root .tag {
  display: inline-block;
  margin-right: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--embed-accent);
  color: var(--embed-accent-ink);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.embed-root code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
`;
