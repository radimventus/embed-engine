import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { REFERENCE_HOUSE_PACKAGE } from "@embed-engine/object-house";

import {
  createFixedClock,
  createDecisionSessionRuntime,
  replayDecisionSession,
  serializeDecisionSessionToJson,
  restoreDecisionSessionFromJson,
} from "./testing";

const SESSION_ROOT = fileURLToPath(new URL(".", import.meta.url));

/** Drop comments so doc mentions of Date.now do not fail the guard. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "clock") {
        // Adapter helpers may call Date.now() inside createSystemClock only.
        continue;
      }
      out.push(...collectTsFiles(full));
      continue;
    }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("ED-DA-06 injectable Runtime clock", () => {
  it("forbids Date.now / new Date / performance.now outside clock adapters", () => {
    const offenders: string[] = [];
    const pattern = /\bDate\.now\s*\(|\bnew\s+Date\s*\(|\bperformance\.now\s*\(/;

    for (const file of collectTsFiles(SESSION_ROOT)) {
      const source = stripComments(readFileSync(file, "utf8"));
      if (pattern.test(source)) {
        offenders.push(relative(SESSION_ROOT, file));
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `Runtime session sources must not call system clock APIs directly:\n${offenders.join("\n")}`,
    );
  });

  it("identical inputs + fixed clock → identical Decision Sessions", () => {
    const clock = createFixedClock(1_000);
    const commands = [
      { type: "SelectRoom" as const, roomId: "room-living" },
      { type: "ChangePriority" as const, priorityIds: ["garden", "space"] },
      { type: "SelectRoom" as const, roomId: "room-kitchen" },
    ];

    const run = () => {
      const runtime = createDecisionSessionRuntime({
        housePackage: REFERENCE_HOUSE_PACKAGE,
        clock,
      });
      let t = 1_000;
      for (const command of commands) {
        t += 10;
        const result = runtime.dispatch(command, t);
        assert.equal(result.ok, true);
      }
      return runtime;
    };

    const a = run();
    const b = run();

    assert.deepEqual(a.getSession(), b.getSession());
    assert.deepEqual(a.getExperience(), b.getExperience());
    assert.equal(
      serializeDecisionSessionToJson(a.getSession()),
      serializeDecisionSessionToJson(b.getSession()),
    );
  });

  it("replay with fixed event timestamps is deterministic", () => {
    const clock = createFixedClock(50);
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock,
      now: 50,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-bath" }, 60);
    runtime.dispatch({ type: "ChangePriority", priorityIds: ["privacy"] }, 70);

    const json = serializeDecisionSessionToJson(runtime.getSession());
    const restored = restoreDecisionSessionFromJson(json);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }

    const replayedA = replayDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      events: restored.session.events,
      createdAt: restored.session.createdAt,
    });
    const replayedB = replayDecisionSession({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      events: restored.session.events,
      createdAt: restored.session.createdAt,
    });

    assert.equal(replayedA.ok && replayedB.ok, true);
    if (!replayedA.ok || !replayedB.ok) {
      return;
    }

    assert.deepEqual(replayedA.session, replayedB.session);
    assert.deepEqual(replayedA.session, restored.session);
  });

  it("dispatch without explicit now uses injected clock", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(42),
      now: 42,
    });
    const result = runtime.dispatch({
      type: "SelectRoom",
      roomId: "room-living",
    });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.event.at, 42);
    assert.equal(result.session.updatedAt, 42);
  });
});
