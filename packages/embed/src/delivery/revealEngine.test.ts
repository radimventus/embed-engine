import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { Window } from "happy-dom";

import { bootstrapEvents } from "./bootstrapEvents";
import {
  LAUNCHER_DEFAULT_LANDING_ANCHOR,
  resolveLandingAnchorId,
  landingAnchorSelector,
} from "./landingAnchorResolver";
import {
  LANDING_REVEAL_DURATION_MS,
  runRevealEngine,
  settleViewportToElement,
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

describe("Reveal Engine (event-driven)", () => {
  afterEach(() => {
    document.body.replaceChildren();
    bootstrapEvents.reset();
  });

  it("waits for EXPERIENCE_READY then settles without DOM polling", async () => {
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
    document.body.appendChild(scroll);

    const controller = new AbortController();
    const states: string[] = [];

    const revealPromise = runRevealEngine({
      studioRoot: scroll,
      scrollContainer: scroll,
      configuredLandingAnchorId: "social-proof",
      modeDefaultLandingAnchorId: "social-proof",
      signal: controller.signal,
      onStateChange: (state) => {
        states.push(state);
      },
    });

    queueMicrotask(() => {
      bootstrapEvents.emit("EXPERIENCE_READY");
    });

    const result = await revealPromise;
    assert.equal(result.state, "active");
    assert.equal(result.anchorId, "social-proof");
    assert.equal(result.degraded, false);
    assert.ok(states.includes("waiting-ready"));
    assert.ok(states.includes("revealing"));
    assert.ok(states.includes("active"));
    assert.equal(scroll.dataset.viewportReady, "true");
    assert.equal(bootstrapEvents.hasEmitted("REVEAL_READY"), true);
  });

  it("aborts cleanly when signal fires before EXPERIENCE_READY", async () => {
    installDom();
    const scroll = document.createElement("div");
    scroll.setAttribute("data-client-studio-root", "");
    document.body.appendChild(scroll);

    const controller = new AbortController();
    queueMicrotask(() => controller.abort());

    const result = await runRevealEngine({
      studioRoot: scroll,
      scrollContainer: scroll,
      configuredLandingAnchorId: "social-proof",
      modeDefaultLandingAnchorId: "social-proof",
      signal: controller.signal,
    });

    assert.equal(result.state, "aborted");
  });

  it("degrades to scroll-top when Experience is ready but no settle target exists", async () => {
    installDom();
    const scroll = document.createElement("div");
    scroll.setAttribute("data-client-studio-root", "");
    Object.defineProperty(scroll, "scrollTo", {
      value() {
        /* no-op */
      },
      configurable: true,
    });
    document.body.appendChild(scroll);

    const controller = new AbortController();
    const revealPromise = runRevealEngine({
      studioRoot: scroll,
      scrollContainer: scroll,
      configuredLandingAnchorId: "social-proof",
      modeDefaultLandingAnchorId: "social-proof",
      signal: controller.signal,
    });

    bootstrapEvents.emit("EXPERIENCE_READY");
    const result = await revealPromise;
    assert.equal(result.state, "degraded");
    assert.equal(bootstrapEvents.hasEmitted("REVEAL_READY"), true);
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

  it("bootstrapEvents emits RUNTIME_READY and EXPERIENCE_READY only once", () => {
    bootstrapEvents.reset();
    let runtimeCount = 0;
    let experienceCount = 0;
    bootstrapEvents.on("RUNTIME_READY", () => {
      runtimeCount += 1;
    });
    bootstrapEvents.on("EXPERIENCE_READY", () => {
      experienceCount += 1;
    });
    bootstrapEvents.emit("RUNTIME_READY");
    bootstrapEvents.emit("RUNTIME_READY");
    bootstrapEvents.emit("EXPERIENCE_READY");
    bootstrapEvents.emit("EXPERIENCE_READY");
    assert.equal(runtimeCount, 1);
    assert.equal(experienceCount, 1);
  });
});
