import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const provider = readFileSync(
  join(import.meta.dirname, "DecisionSessionRuntimeProvider.tsx"),
  "utf8",
);

test("browser reload starts a fresh Client DecisionSession", () => {
  assert.match(
    provider,
    /const decisionSessionId: string = crypto\.randomUUID\(\)/,
  );

  assert.match(
    provider,
    /writeDecisionSessionPointer\(scope, decisionSessionId\)/,
  );

  assert.doesNotMatch(
    provider,
    /readDecisionSessionPointer\(scope\)/,
  );

  assert.doesNotMatch(
    provider,
    /restorePublicDecisionSession/,
  );

  assert.doesNotMatch(
    provider,
    /restoredSession/,
  );
});

test("fresh boot retains persistence for the current new session", () => {
  assert.match(provider, /persistPublicDecisionSession/);
  assert.match(provider, /serializeDecisionSession/);
});
