/**
 * Client Studio styles for Embed Delivery (fonts, shell, host isolation).
 * Main Tailwind CSS is registered by the Vite bundle via registerClientStudioCss.
 */

let registeredCss: string | null = null;
let injected = false;

const FONT_LINK_ID = "embed-client-studio-fonts";
const STYLE_ID = "embed-client-studio-css";
const SHELL_STYLE_ID = "embed-client-studio-shell-css";

/** Inter — same weights as standalone Client Studio index.html. */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap";

/**
 * Maps standalone `html/body/#root` assumptions onto the embed mount node
 * and reduces accidental host-page inheritance inside the Experience.
 */
const SHELL_CSS = `
[data-client-studio-root] {
  display: block;
  min-height: 100vh;
  width: 100%;
  overflow-x: auto;
  overscroll-behavior: none;
  color: rgb(0 25 48);
  background-color: #f7f6f4;
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  isolation: isolate;
  box-sizing: border-box;
  line-height: 1.5;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
[data-client-studio-root],
[data-client-studio-root] *,
[data-client-studio-root] *::before,
[data-client-studio-root] *::after {
  box-sizing: border-box;
  border-color: #e3e3e3;
}
[data-client-studio-root] img,
[data-client-studio-root] svg,
[data-client-studio-root] video,
[data-client-studio-root] canvas {
  display: block;
  vertical-align: middle;
}
[data-client-studio-root] button,
[data-client-studio-root] input,
[data-client-studio-root] textarea,
[data-client-studio-root] select {
  font: inherit;
  color: inherit;
}
`;

export function registerClientStudioCss(css: string): void {
  registeredCss = css;
}

function ensureFonts(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(FONT_LINK_ID)) {
    return;
  }

  const preconnectGoogle = document.createElement("link");
  preconnectGoogle.rel = "preconnect";
  preconnectGoogle.href = "https://fonts.googleapis.com";

  const preconnectGstatic = document.createElement("link");
  preconnectGstatic.rel = "preconnect";
  preconnectGstatic.href = "https://fonts.gstatic.com";
  preconnectGstatic.crossOrigin = "anonymous";

  const fontLink = document.createElement("link");
  fontLink.id = FONT_LINK_ID;
  fontLink.rel = "stylesheet";
  fontLink.href = FONT_HREF;

  document.head.append(preconnectGoogle, preconnectGstatic, fontLink);
}

function upsertStyle(id: string, css: string): void {
  let style = document.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = css;
  // Keep Embed styles after host styles so utilities win collisions.
  document.head.appendChild(style);
}

/**
 * Inject fonts + full Client Studio CSS + embed shell bridge.
 * Idempotent; safe to call on every production mount.
 */
export function ensureClientStudioStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  ensureFonts();

  if (registeredCss !== null) {
    upsertStyle(STYLE_ID, registeredCss);
  }

  upsertStyle(SHELL_STYLE_ID, SHELL_CSS);
  injected = true;
}

export function getClientStudioStylesInjected(): boolean {
  return injected;
}
