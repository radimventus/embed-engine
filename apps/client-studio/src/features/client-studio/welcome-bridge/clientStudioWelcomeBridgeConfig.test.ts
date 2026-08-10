import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG } from "./clientStudioWelcomeBridgeConfig";

describe("CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG", () => {
  it("is a config-driven Experience variant without Runtime coupling", () => {
    assert.equal(CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.variant, "client-studio-tour-to-priority");
    assert.match(CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.title, /CONIS/i);
    assert.match(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.ctaLabel,
      /nastavení priorit/i,
    );
    assert.match(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.description,
      /Ptejte se, na co uznáte za vhodné/,
    );
    assert.equal(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.triggers.some(
        (trigger) => trigger.kind === "on-continue-to-priority",
      ),
      false,
    );
    const delay = CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.triggers.find(
      (trigger) => trigger.kind === "delay-after-mount",
    );
    assert.ok(delay !== undefined && delay.kind === "delay-after-mount");
    assert.equal(delay.delayMs, 20_000);
  });
});
