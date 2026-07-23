import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { Window } from "happy-dom";

import { createDeliveryRuntime } from "./createDeliveryRuntime";
import {
  captureHostScroll,
  lockHostScroll,
  unlockHostScroll,
} from "./hostScrollLock";
import { launchExperience } from "./launchExperience";
import { createOverlaySurface } from "./overlaySurface";
import { LAUNCHER_DEFAULT_PRESENTATION } from "./presentation";
import { resolveObjectPackage, DEFAULT_OBJECT_ID } from "./resolveObjectPackage";
import {
  isLegacyGardenMount,
  isProductionMount,
  resolveExperienceMode,
} from "./types";

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

  document.body.innerHTML = `<div id="demo"></div><button id="cta">Open</button>`;
  Object.defineProperty(window, "scrollX", { value: 0, configurable: true });
  Object.defineProperty(window, "scrollY", {
    value: 120,
    configurable: true,
    writable: true,
  });
  window.scrollTo = ((x: number, y: number) => {
    Object.defineProperty(window, "scrollX", { value: x, configurable: true });
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  }) as typeof window.scrollTo;

  return window;
}

describe("Embed delivery layer preparation", () => {
  it("resolves the pilot Object Package by default", () => {
    const pack = resolveObjectPackage();
    assert.equal(pack.identity.id, DEFAULT_OBJECT_ID);
    assert.equal(pack.identity.id, "house-modern-01");
  });

  it("rejects unknown object ids without Garden fallback", () => {
    assert.throws(() => resolveObjectPackage("garden"), /unknown objectId/);
  });

  it("creates a Decision Session Runtime for delivery", () => {
    const runtime = createDeliveryRuntime(resolveObjectPackage());
    const experience = runtime.getExperience();
    assert.ok(experience);
    assert.equal(experience!.context.object.id, "house-modern-01");
  });

  it("classifies mount options for production vs legacy garden", () => {
    assert.equal(
      isProductionMount({ target: "#x", objectId: "house-modern-01" }),
      true,
    );
    assert.equal(isLegacyGardenMount({ target: "#x", fixture: "garden" }), true);
    assert.equal(isProductionMount({ target: "#x", fixture: "garden" }), false);
  });

  it("resolves Experience Mode defaults for launcher vs inline", () => {
    assert.equal(resolveExperienceMode({ target: "#x" }), "inline");
    assert.equal(
      resolveExperienceMode({ mode: "launcher", launcher: "#cta" }),
      "launcher",
    );
    assert.equal(
      resolveExperienceMode({ launcher: "#cta", objectId: "house-modern-01" }),
      "launcher",
    );
  });
});

describe("Delivery overlay surface", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";
  });

  it("creates a fullscreen overlay and restores host scroll on dispose", () => {
    installDom();
    const snapshot = captureHostScroll();
    assert.equal(snapshot.scrollY, 120);

    let closed = false;
    const overlay = createOverlaySurface({
      onClose: () => {
        closed = true;
      },
    });

    assert.ok(document.querySelector("[data-embed-overlay]"));
    assert.ok(document.querySelector("[data-embed-overlay-mount]"));
    assert.equal(typeof overlay.mountTarget.setAttribute, "function");
    assert.equal(document.body.style.overflow, "hidden");

    const close = document.querySelector<HTMLButtonElement>("[data-embed-close]");
    assert.ok(close);
    close!.click();
    assert.equal(closed, true);

    overlay.dispose();
    assert.equal(document.querySelector("[data-embed-overlay]"), null);
    assert.equal(window.scrollY, 120);
  });

  it("initializes mount container when ParentNode.append is missing", () => {
    installDom();
    const proto = window.Element.prototype as Element & {
      append?: (...nodes: Node[]) => void;
    };
    const original = proto.append;
    delete proto.append;

    try {
      const overlay = createOverlaySurface({ onClose: () => undefined });
      assert.ok(overlay.mountTarget);
      assert.equal(
        overlay.mountTarget.getAttribute("data-embed-overlay-mount"),
        "",
      );
      overlay.dispose();
    } finally {
      if (original) {
        proto.append = original;
      }
    }
  });

  it("lock/unlock host scroll is idempotent with snapshot", () => {
    installDom();
    const snapshot = captureHostScroll();
    lockHostScroll(snapshot);
    assert.equal(document.body.style.position, "fixed");
    unlockHostScroll(snapshot);
    assert.equal(document.body.style.position, "");
    assert.equal(window.scrollY, 120);
  });
});

describe("Launcher launch failure recovery", () => {
  afterEach(() => {
    document.body.replaceChildren();
    document.body.style.cssText = "";
    document.documentElement.style.cssText = "";
  });

  it("bootstrap failure (unknown objectId) restores host without leftover overlay", () => {
    installDom();
    assert.throws(
      () =>
        launchExperience(
          {
            presentation: LAUNCHER_DEFAULT_PRESENTATION,
            launchContext: { hostKind: "partner-website" },
            objectId: "does-not-exist",
          },
          { onClose: () => undefined },
        ),
      /unknown objectId/,
    );
    assert.equal(document.querySelector("[data-embed-overlay]"), null);
    assert.equal(document.body.style.position, "");
    assert.equal(window.scrollY, 120);
  });

  it("studio mount failure (Node stub) restores host without leftover overlay", () => {
    installDom();
    assert.throws(
      () =>
        launchExperience(
          {
            presentation: LAUNCHER_DEFAULT_PRESENTATION,
            launchContext: { hostKind: "partner-website" },
            objectId: "house-modern-01",
          },
          { onClose: () => undefined },
        ),
      /Vite bundle/,
    );
    assert.equal(document.querySelector("[data-embed-overlay]"), null);
    assert.equal(document.body.style.position, "");
  });
});
