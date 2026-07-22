/**
 * Optional Client Studio CSS registration (Vite bundle injects styles).
 * Node unit tests never register CSS — production mount still works without styles in happy-dom.
 */

let registeredCss: string | null = null;
let injected = false;

export function registerClientStudioCss(css: string): void {
  registeredCss = css;
}

export function ensureClientStudioStyles(): void {
  if (injected || registeredCss === null || typeof document === "undefined") {
    return;
  }

  if (document.getElementById("embed-client-studio-css")) {
    injected = true;
    return;
  }

  const style = document.createElement("style");
  style.id = "embed-client-studio-css";
  style.textContent = registeredCss;
  document.head.appendChild(style);
  injected = true;
}
