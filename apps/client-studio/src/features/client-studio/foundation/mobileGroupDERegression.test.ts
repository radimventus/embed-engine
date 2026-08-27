import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

test("51 Audit mobile title is exact 80 percent of desktop text-5xl", () => {
  const audit = read(
    "../sections/AuditLeadCapture/AuditTransition.tsx",
  );

  assert.match(audit, /text-5xl/);
  assert.match(audit, /mobile:text-\[2\.4rem\]/);
  assert.doesNotMatch(audit, /mobile:text-\[80%\]/);
});

test("52 Audit explanatory copy uses full mobile band", () => {
  const audit = read(
    "../sections/AuditLeadCapture/AuditTransition.tsx",
  );

  assert.ok(
    (audit.match(/mobile:max-w-none/g) ?? []).length >= 2,
  );

  assert.ok(
    (audit.match(/max-w-\[52\.8rem\]/g) ?? []).length >= 2,
  );
});

test("61 canonical journey footer is a single mobile row", () => {
  const cta = read("./journeyCta.ts");
  const frame = read("./JourneySceneFrame.tsx");

  assert.match(cta, /mobile:flex-row/);
  assert.match(cta, /mobile:flex-nowrap/);
  assert.doesNotMatch(cta, /mobile:flex-col/);

  assert.match(frame, /mobile:flex-row/);
  assert.match(frame, /mobile:flex-nowrap/);
  assert.match(
    frame,
    /mobile:w-auto mobile:shrink-0 mobile:whitespace-nowrap/,
  );
});

test("63 FAQ has only one compact mobile vertical-padding owner", () => {
  const faq = read(
    "../sections/AIAdvisor/SuggestedQuestions.tsx",
  );

  assert.match(faq, /normal-case mobile:normal-case/);

  assert.doesNotMatch(
    faq,
    /normal-case mobile:normal-case mobile:py-2/,
  );

  assert.match(
    faq,
    /mobile:min-h-0 mobile:gap-2 mobile:px-4 mobile:py-2/,
  );

  assert.match(faq, /mobile:h-6 mobile:w-6/);
});

test("67 loading copy is canonical Czech", () => {
  const runtime = read(
    "../runtime/DecisionSessionRuntimeProvider.tsx",
  );

  const bootstrap = read(
    "./RuntimeBootstrapGate.tsx",
  );

  const all=runtime+bootstrap;

  assert.match(all, /Připravuji prostředí/);

  assert.doesNotMatch(
    all,
    /Připravuji[^"'`]*(?:Decision|decision)[^"'`]*(?:Session|session)/,
  );
});
