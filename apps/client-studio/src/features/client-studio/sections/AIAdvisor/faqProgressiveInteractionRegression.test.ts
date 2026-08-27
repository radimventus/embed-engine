import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { faqDatasetIdentity } from "./faqProgressiveLoading";

const source = readFileSync(
  join(
    process.cwd(),
    "src/features/client-studio/sections/AIAdvisor/SuggestedQuestions.tsx",
  ),
  "utf8",
);

const tenFaq = Array.from({ length: 10 }, (_, index) => ({
  id: `faq-${index + 1}`,
  question: `Otázka ${index + 1}`,
  answer: `Odpověď ${index + 1}`,
}));

describe("TASK 73 FAQ progressive state regression", () => {
  it("keeps semantic identity across a fresh array reference", () => {
    const refreshed = tenFaq.map((item) => ({
      ...item,
    }));

    assert.notEqual(refreshed, tenFaq);

    assert.equal(faqDatasetIdentity(refreshed), faqDatasetIdentity(tenFaq));
  });

  it("changes identity when the actual FAQ dataset changes", () => {
    const changed = tenFaq.map((item, index) =>
      index === 5
        ? {
            ...item,
            answer: "Změněná odpověď",
          }
        : item,
    );

    assert.notEqual(faqDatasetIdentity(changed), faqDatasetIdentity(tenFaq));
  });

  it("does not reset directly from the items array reference", () => {
    assert.doesNotMatch(source, /\},\s*\[items\]\);/);

    assert.match(source, /const datasetIdentity = faqDatasetIdentity\(items\)/);

    assert.match(source, /\[datasetIdentity,\s*items\.length\]/);
  });

  it("preserves progressive load-more behavior", () => {
    assert.match(source, /nextFaqVisibleCount\(current,\s*items\.length\)/);
  });

  it("preserves durable QuestionOpened signaling", () => {
    assert.match(source, /onQuestionOpened\?\.\(item\)/);
  assert.match(source, /mobile:normal-case/);
  assert.match(source, /mobile:py-2/);
  assert.match(source, /mobile:min-h-0/);

  });
});
