import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG,
  PRIORITY_MOTIVATION_BANNER_COPY,
} from "./clientStudioWelcomeBridgeConfig";

describe("CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG", () => {
  it("is a config-driven Experience variant without Runtime coupling", () => {
    assert.equal(CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.variant, "client-studio-tour-to-priority");
    assert.equal(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.description,
      PRIORITY_MOTIVATION_BANNER_COPY,
    );
    assert.match(
      CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content.ctaLabel,
      /nastavení priorit/i,
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

  it("renders one motivation sentence and drops the old CONIS intro", () => {
    const { title, headline, description } = CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG.content;
    assert.equal(title, "");
    assert.equal(headline, "");
    assert.equal(
      description,
      "Nastavte si priority, které zohledníme v dalším obsahu a přípravě PDF ke stažení.",
    );
    assert.equal(title.includes("Jmenuji se CONIS"), false);
    assert.equal(headline.includes("Jmenuji se CONIS"), false);
    assert.equal(description.includes("Jmenuji se CONIS"), false);
    assert.equal(description.includes("Ptejte se, na co uznáte za vhodné"), false);
    assert.equal(description.includes("Vaše odpovědi ovlivní další témata"), false);
    assert.equal(
      [title, headline, description].filter((part) => part.trim() !== "").length,
      1,
    );
  });
});
