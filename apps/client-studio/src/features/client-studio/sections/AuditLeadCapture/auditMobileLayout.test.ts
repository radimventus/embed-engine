import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(
  process.cwd(),
  "src/features/client-studio/sections/AuditLeadCapture",
);

const read = (name: string) =>
  fs.readFileSync(path.join(root, name), "utf8");

test("Audit visible headings use reduced mobile typography", () => {
  const situation = read("SituationSelect.tsx");
  const workflow = read("AssessmentWorkflow.tsx");

  assert.match(situation, /mobile:text-\[0\.8rem\]/);
  assert.match(workflow, /mobile:text-\[0\.8rem\]/);
});

test("Audit situation cards keep the full mobile content band", () => {
  const situation = read("SituationSelect.tsx");

  assert.match(situation, /AUDIT_PANEL_MAX_WIDTH_CLASS/);
  assert.match(situation, /px-section/);
  assert.match(situation, /w-\[70%\] mobile:w-full/);
  assert.match(situation, /grid grid-cols-2/);
});

test("Audit workflow uses 2x2 mobile station and caption grids", () => {
  const workflow = read("AssessmentWorkflow.tsx");

  const grids =
    workflow.match(
      /grid grid-cols-4 gap-4 mobile:grid-cols-2 mobile:gap-4/g,
    ) ?? [];

  assert.equal(grids.length, 2);
  assert.match(workflow, /stations\.map/);
});

test("Audit desktop four-column authority remains", () => {
  const workflow = read("AssessmentWorkflow.tsx");

  assert.match(workflow, /grid-cols-4/);
});
