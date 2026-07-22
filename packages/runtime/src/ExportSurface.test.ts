import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(here, relative), "utf8");
}

/** Drop block and line comments so doc mentions do not fail the guard. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const FORBIDDEN_PUBLIC_SYMBOLS = [
  "composeDecisionStory",
  "composeDecisionMoves",
  "composeDecisionOutcome",
  "composeDecisionTerminal",
  "composeAIContext",
  "interpretDecisionSession",
  "evaluateInterpretationRules",
  "evaluatePrioritySignals",
  "evaluateDecisionFocus",
  "validateCommand",
  "applyDecisionEvent",
  "dispatchCommand",
  "createDecisionSession",
  "selectRoom",
  "projectFromInterpretation",
] as const;

/**
 * ED-DA-03 — public export surface must not expose pipeline composers.
 */
describe("Runtime public export surface (ED-DA-03)", () => {
  it("public index and session public-api omit pipeline composers", () => {
    const publicApiCode = stripComments(read("session/public-api.ts"));
    const indexCode = stripComments(read("index.ts"));
    const sessionIndexSource = read("session/index.ts");

    for (const forbidden of FORBIDDEN_PUBLIC_SYMBOLS) {
      const pattern = new RegExp(`\\b${forbidden}\\b`);
      assert.equal(
        pattern.test(publicApiCode),
        false,
        `public-api must not export ${forbidden}`,
      );
      assert.equal(
        pattern.test(indexCode),
        false,
        `index must not export ${forbidden}`,
      );
    }

    assert.match(sessionIndexSource, /public-api/);
    assert.equal(
      stripComments(sessionIndexSource).includes("composeDecision"),
      false,
    );
    assert.match(indexCode, /createDecisionSessionRuntime/);
    assert.match(indexCode, /ExperienceContext/);
    assert.match(indexCode, /DecisionTerminalContract/);
    assert.match(indexCode, /AIContextContract/);
  });

  it("testing entry documents and exports pipeline composers", () => {
    const testingSource = read("testing.ts");
    const sessionTestingCode = stripComments(read("session/testing.ts"));

    assert.match(testingSource, /session\/testing/);
    assert.match(sessionTestingCode, /composeDecisionStory/);
    assert.match(sessionTestingCode, /interpretDecisionSession/);
  });
});
