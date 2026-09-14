import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("TASK 114 — Partner Environment switch uses canonical platform-admin authority", async () => {
  const source = await readFile(
    new URL("./partnerSessionRepository.ts", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const isConisAdmin = isPlatformAdmin\(account\.roles\);/,
  );

  assert.doesNotMatch(
    source,
    /const isConisAdmin = account\.roles\.includes\(['"]conis-admin['"]\)/,
  );
});
