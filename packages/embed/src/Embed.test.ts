import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { Window } from "happy-dom";
import { Embed } from "./Embed";

function installDom(): Window {
  const window = new Window({ url: "https://embed.local/" });
  const { document } = window;

  Object.defineProperty(globalThis, "window", {
    value: window,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: document,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "HTMLElement", {
    value: window.HTMLElement,
    configurable: true,
    writable: true,
  });

  document.body.innerHTML = `<div id="demo"></div>`;
  return window;
}

describe("Embed.mount / Embed.unmount", () => {
  afterEach(() => {
    Embed.unmount();
  });

  it("exposes only mount, unmount, and version on the public object", () => {
    assert.deepEqual(Object.keys(Embed).sort(), ["mount", "unmount", "version"]);
    assert.equal(typeof Embed.mount, "function");
    assert.equal(typeof Embed.unmount, "function");
    assert.equal(typeof Embed.version, "string");
  });

  it("legacy fixture garden still mounts Priority Journey HTML", () => {
    installDom();
    Embed.mount({ target: "#demo", fixture: "garden" });

    const root = document.querySelector("[data-embed-root]");
    assert.ok(root);
    assert.match(root!.innerHTML, /Priority Experience/);
    assert.match(root!.innerHTML, /data-stage="Selection"/);
    assert.match(root!.innerHTML, /Zvolit prioritu: garden/);
  });

  it("unmount removes the legacy renderer from the host", () => {
    installDom();
    Embed.mount({ target: "#demo", fixture: "garden" });
    assert.ok(document.querySelector("[data-embed-root]"));

    Embed.unmount("#demo");
    assert.equal(document.querySelector("[data-embed-root]"), null);
    assert.equal(document.getElementById("demo")?.innerHTML, "");
  });

  it("repeated legacy mount replaces the previous session", () => {
    installDom();
    Embed.mount({ target: "#demo", fixture: "garden" });
    const first = document.querySelector("[data-embed-root]");
    assert.ok(first);

    Embed.mount({ target: "#demo", fixture: "garden" });
    const roots = document.querySelectorAll("[data-embed-root]");
    assert.equal(roots.length, 1);
    assert.match(roots[0]!.innerHTML, /data-stage="Selection"/);
  });

  it("legacy garden click advances via Priority Runtime", () => {
    installDom();
    Embed.mount({ target: "#demo", fixture: "garden" });

    const button = document.querySelector<HTMLButtonElement>(
      '[data-action="select-garden"]',
    );
    assert.ok(button);
    button!.click();

    const root = document.querySelector("[data-embed-root]");
    assert.match(root!.innerHTML, /data-stage="Confirmation"/);
    assert.match(root!.innerHTML, /Zahrada je pro vás podstatná/);
  });
});
