/**
 * PT-EMBED-02A — CSS Isolation Policy (Delivery Layer).
 *
 * Embed Experience must not depend on host `html` / `body` / `a` / `button` / `*`
 * styles. Public surfaces mark `[data-embed-boundary]`; this CSS reclaims
 * critical visual properties inside that boundary so partner themes cannot
 * rewrite Experience identity (CTA text color, link underlines, etc.).
 *
 * Utilities remain the design source of truth (Tailwind `important` is scoped
 * to `[data-embed-boundary]`). Isolation rules neutralize host tag selectors;
 * public surface hooks (CTA, Close) restate identity at specificity that beats
 * `a:link` / `a:visited` reclaim rules.
 */

/** Attribute marking every Embed Experience surface root. */
export const EMBED_BOUNDARY_ATTR = "data-embed-boundary";

const B = EMBED_BOUNDARY_ATTR;

/**
 * Isolation CSS injected by Delivery (`ensureClientStudioStyles`).
 * Selectors are boundary-scoped — never bare `a` / `button` / `*`.
 */
export const CSS_ISOLATION_POLICY = `
/* ── Boundary inheritance root (no reliance on host html/body) ── */
[${B}] {
  color: rgb(0 25 48);
  font-family: Inter, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  text-decoration: none;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  isolation: isolate;
  box-sizing: border-box;
}

[${B}],
[${B}] *,
[${B}] *::before,
[${B}] *::after {
  box-sizing: border-box;
  border-color: #e3e3e3;
}

/*
 * Reclaim interactive elements from host tag selectors.
 * Color / background / font use high-specificity boundary rules WITHOUT
 * !important so scoped Tailwind utilities can still express design tokens.
 * text-decoration / appearance use !important — common host link attacks.
 * Pseudo-class rules must NOT reset color (would beat attribute CTA hooks).
 */
[${B}] a {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none !important;
  text-transform: none;
  border-style: none;
  border-width: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer;
  transition: none;
}

[${B}] a:link,
[${B}] a:visited,
[${B}] a:hover,
[${B}] a:active,
[${B}] a:focus,
[${B}] a:focus-visible {
  text-decoration: none !important;
  background-image: none;
  outline: none;
  box-shadow: none;
}

[${B}] button {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none !important;
  text-transform: none;
  border-style: none;
  border-width: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer;
  transition: none;
}

[${B}] button:hover,
[${B}] button:active,
[${B}] button:focus,
[${B}] button:focus-visible {
  outline: none;
  box-shadow: none;
}

[${B}] input,
[${B}] textarea,
[${B}] select {
  color: inherit;
  background-color: transparent;
  background-image: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-decoration: none;
  border-style: solid;
  border-width: 1px;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: text;
  transition: none;
}

[${B}] img,
[${B}] svg,
[${B}] video,
[${B}] canvas {
  display: block;
  max-width: 100%;
  vertical-align: middle;
  border-style: none !important;
}

[${B}] svg {
  max-width: none;
}

/*
 * Public CTA hook — specificity must beat [${B}] a and host a:link/a:visited.
 * Restates PrimaryLink md identity (does not change reference look).
 */
[${B}] a[data-embed-hero-cta],
[${B}] a[data-embed-hero-cta]:link,
[${B}] a[data-embed-hero-cta]:visited,
[${B}] a[data-embed-hero-cta]:hover,
[${B}] a[data-embed-hero-cta]:active,
[${B}] a[data-embed-hero-cta]:focus,
[${B}] a[data-embed-hero-cta]:focus-visible {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #ffffff !important;
  background-color: #001930 !important;
  background-image: none !important;
  font-family: Inter, system-ui, sans-serif !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
  line-height: 1.5 !important;
  letter-spacing: normal !important;
  text-align: center !important;
  text-decoration: none !important;
  text-transform: none !important;
  border-style: none !important;
  border-width: 0 !important;
  border-radius: 8px !important;
  outline: none !important;
  box-shadow: none !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
  opacity: 1 !important;
  padding: 1rem 2rem !important;
  margin: 0 !important;
  transition: none !important;
}

[${B}] button[data-embed-close],
[${B}] button[data-embed-close]:hover,
[${B}] button[data-embed-close]:active,
[${B}] button[data-embed-close]:focus,
[${B}] button[data-embed-close]:focus-visible {
  color: inherit !important;
  background-color: transparent !important;
  background-image: none !important;
  font-family: Inter, system-ui, sans-serif !important;
  text-decoration: none !important;
  border-style: none !important;
  border-width: 0 !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}
`;
