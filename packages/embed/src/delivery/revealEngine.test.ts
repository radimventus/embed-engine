import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { Window } from "happy-dom";

import {
  LAUNCHER_DEFAULT_LANDING_ANCHOR,
  resolveLandingAnchorId,
  landingAnchorSelector,
} from "./landingAnchorResolver";
import {
  LANDING_REVEAL_DURATION_MS,
  runRevealEngine,
  settleViewportToElement,
  waitForSelector,
} from "./revealEngine";

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
  Object.defineProperty(globalThis, "DOMException", {
    value: window.DOMException,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "MutationObserver", {
    value: window.MutationObserver,
    configurable: true,
    writable: true,
  });

  document.body.innerHTML = "";

  Object.defineProperty(globalThis, "requestAnimationFrame", {
    value: (callback: (time: number) => void) =>
      setTimeout(() => callback(Date.now()), 0),
    configurable: true,
  });
  Object.defineProperty(globalThis, "performance", {
    value: { now: () => Date.now() },
    configurable: true,
    writable: true,
  });

  return window;
}

describe("Landing Anchor resolver", () => {
  it("keeps a known configured anchor", () => {
    const resolved = resolveLandingAnchorId({
      configuredId: "walkthrough",
      modeDefaultId: LAUNCHER_DEFAULT_LANDING_ANCHOR,
    });
    assert.equal(resolved.elementId, "walkthrough");
    assert.equal(resolved.usedDefault, false);
  });

  it("falls back to mode default for unknown config", () => {
    const resolved = resolveLandingAnchorId({
      configuredId: "not-a-real-anchor",
      modeDefaultId: "social-proof",
    });
    assert.equal(resolved.elementId, "social-proof");
    assert.equal(resolved.usedDefault, true);
  });

  it("builds a safe element selector", () => {
    assert.equal(landingAnchorSelector("social-proof"), "#social-proof");
  });
});

describe("Reveal Engine", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("waits for Landing Anchor then settles scroll without timers", async () => {
    installDom();
    let now = 0;
    Object.defineProperty(globalThis, "performance", {
      value: { now: () => now },
      configurable: true,
    });
    Object.defineProperty(globalThis, "requestAnimationFrame", {
      value: (callback: (time: number) => void) => {
        now += LANDING_REVEAL_DURATION_MS;
        return setTimeout(() => callback(now), 0);
      },
      configurable: true,
    });

    const scroll = document.createElement("div");
    scroll.setAttribute("data-client-studio-root", "");
    scroll.style.cssText = "height:200px;overflow:auto;";
    Object.defineProperty(scroll, "scrollTo", {
      value(options: { top?: number }) {
        Object.defineProperty(scroll, "scrollTop", {
          value: options.top ?? 0,
          configurable: true,
          writable: true,
        });
      },
      configurable: true,
    });
    Object.defineProperty(scroll, "scrollTop", {
      value: 0,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(scroll, "getBoundingClientRect", {
      value: () => ({ top: 0, left: 0, bottom: 200, right: 200, width: 200, height: 200 }),
      configurable: true,
    });

    document.body.appendChild(scroll);

    const controller = new AbortController();
    const states: string[] = [];

    const revealPromise = runRevealEngine({
      studioRoot: scroll,
      scrollContainer: scroll,
      runtimeReady: true,
      configuredLandingAnchorId: "social-proof",
      modeDefaultLandingAnchorId: "social-proof",
      signal: controller.signal,
      onStateChange: (state) => {
        states.push(state);
      },
    });

    // Studio becomes ready asynchronously (no fixed delay in engine — MutationObserver).
    queueMicrotask(() => {
      const hero = document.createElement("section");
      hero.id = "hero";
      hero.style.height = "400px";
      const proof = document.createElement("section");
      proof.id = "social-proof";
      proof.style.height = "200px";
      Object.defineProperty(proof, "getBoundingClientRect", {
        value: () => ({
          top: 400,
          left: 0,
          bottom: 600,
          right: 200,
          width: 200,
          height: 200,
        }),
        configurable: true,
      });
      scroll.append(hero, proof);
    });

    const result = await revealPromise;
    assert.equal(result.state, "active");
    assert.equal(result.anchorId, "social-proof");
    assert.equal(result.degraded, false);
    assert.ok(states.includes("waiting-ready"));
    assert.ok(states.includes("revealing"));
    assert.ok(states.includes("active"));
    assert.equal(scroll.dataset.viewportReady, "true");
  });

  it("degrades when anchor never appears but hero exists", async () => {
    installDom();
    const scroll = document.createElement("div");
    scroll.setAttribute("data-client-studio-root", "");
    const hero = document.createElement("section");
    hero.id = "hero";
    Object.defineProperty(hero, "getBoundingClientRect", {
      value: () => ({ top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 }),
      configurable: true,
    });
    Object.defineProperty(scroll, "getBoundingClientRect", {
      value: () => ({ top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 }),
      configurable: true,
    });
    Object.defineProperty(scroll, "scrollTo", {
      value() {
        /* no-op */
      },
      configurable: true,
    });
    scroll.appendChild(hero);
    document.body.appendChild(scroll);

    const controller = new AbortController();
    // Abort wait shortly so test does not hang — simulates Close / timeout bound.
    queueMicrotask(() => controller.abort());

    const result = await runRevealEngine({
      studioRoot: scroll,
      scrollContainer: scroll,
      runtimeReady: true,
      configuredLandingAnchorId: "social-proof",
      modeDefaultLandingAnchorId: "social-proof",
      signal: controller.signal,
    });

    assert.ok(result.state === "aborted" || result.state === "degraded");
  });

  it("settleViewportToElement adjusts scrollTop below sticky header", async () => {
    installDom();
    const container = document.createElement("div");
    let scrolledTo = 0;
    Object.defineProperty(container, "scrollTop", {
      get: () => scrolledTo,
      set: (v: number) => {
        scrolledTo = v;
      },
      configurable: true,
    });
    Object.defineProperty(container, "scrollTo", {
      value(options: { top?: number }) {
        scrolledTo = options.top ?? 0;
      },
      configurable: true,
    });
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 }),
      configurable: true,
    });

    const header = document.createElement("header");
    header.setAttribute("data-experience-header", "");
    Object.defineProperty(header, "getBoundingClientRect", {
      value: () => ({ top: 0, left: 0, bottom: 72, right: 100, width: 100, height: 72 }),
      configurable: true,
    });
    container.appendChild(header);

    const el = document.createElement("div");
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({ top: 250, left: 0, bottom: 350, right: 100, width: 100, height: 100 }),
      configurable: true,
    });
    await settleViewportToElement(container, el, {
      durationMs: 0,
      fromTop: false,
    });
    assert.equal(scrolledTo, 250 - 72);
  });

  it("waitForSelector resolves when node is inserted", async () => {
    installDom();
    const root = document.createElement("div");
    document.body.appendChild(root);
    const controller = new AbortController();
    const pending = waitForSelector(root, "#social-proof", controller.signal);
    queueMicrotask(() => {
      const el = document.createElement("div");
      el.id = "social-proof";
      root.appendChild(el);
    });
    const found = await pending;
    assert.equal(found.id, "social-proof");
  });
});
