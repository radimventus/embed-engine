/**
 * PT-007A — Deterministic extraction fallback (no LLM required).
 */

import type {
  AcceptedOption,
  AnalysisResult,
  AnalysisValue,
  Concern,
  Constraint,
  Fact,
  Goal,
  Preference,
  RejectedOption,
} from "./models/AnalysisResult";

const FALLBACK_CONFIDENCE = 0.72;

function entry<T extends { readonly key: string; readonly value: AnalysisValue }>(
  key: string,
  value: AnalysisValue,
): T {
  return Object.freeze({ key, value }) as T;
}

/**
 * Rule-based extraction for pilot / offline / parse-failure paths.
 */
export function deterministicAnalyze(message: string): AnalysisResult {
  const text = message.trim();
  const lower = text.toLowerCase();

  const facts: Fact[] = [];
  const preferences: Preference[] = [];
  const constraints: Constraint[] = [];
  const goals: Goal[] = [];
  const concerns: Concern[] = [];
  const rejectedOptions: RejectedOption[] = [];
  const acceptedOptions: AcceptedOption[] = [];

  // Family / children → fact
  if (
    /\b(dvě|dve|2)\s+dět/i.test(text) ||
    /\b(two|2)\s+(kids|children)\b/i.test(lower)
  ) {
    facts.push(entry("familySize", 4));
  }

  // Budget constraint: "6,5 milionu" / "6.5 million"
  const budgetMillion = text.match(/(\d+[.,]\d+)\s*milion/i);
  const budgetPlain = text.match(
    /\b(rozpočet|budget)\b[^0-9]{0,24}(\d[\d\s.,]{3,})\b/i,
  );
  if (budgetMillion) {
    const raw = budgetMillion[1]!.replace(",", ".");
    const millions = Number.parseFloat(raw);
    if (Number.isFinite(millions)) {
      constraints.push(entry("budget", Math.round(millions * 1_000_000)));
    }
  } else if (budgetPlain) {
    const digits = budgetPlain[2]!.replace(/[\s.]/g, "").replace(",", "");
    const value = Number.parseInt(digits, 10);
    if (Number.isFinite(value)) {
      constraints.push(entry("budget", value));
    }
  }

  // Accepted heating (opinion change) — check before reject so "vlastně nevadí" wins
  const acceptsHeatPump =
    /(vlastně|už|now|actually)[\s\S]{0,48}(nevadí|nevadilo|ok|souhlas)/i.test(
      text,
    ) ||
    /(nevadí|nevadilo|akceptujeme|souhlasíme)[\s\S]{0,40}(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)/i.test(
      text,
    ) ||
    /(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)[\s\S]{0,40}(nevadí|ok|accept)/i.test(
      text,
    );

  // Rejected heating option
  const rejectsHeatPump =
    /(nechceme|nechci|nechce|without|don't want|do not want|no)\b[\s\S]{0,40}(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)/i.test(
      text,
    ) ||
    /(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)\b[\s\S]{0,40}(nechceme|nechci|ne)/i.test(
      text,
    );

  if (acceptsHeatPump) {
    acceptedOptions.push(entry("heating", "heat-pump"));
  } else if (rejectsHeatPump) {
    rejectedOptions.push(entry("heating", "heat-pump"));
  }

  const extracted =
    facts.length +
      preferences.length +
      constraints.length +
      goals.length +
      concerns.length +
      rejectedOptions.length +
      acceptedOptions.length >
    0;

  return Object.freeze({
    facts: Object.freeze(facts),
    preferences: Object.freeze(preferences),
    constraints: Object.freeze(constraints),
    goals: Object.freeze(goals),
    concerns: Object.freeze(concerns),
    rejectedOptions: Object.freeze(rejectedOptions),
    acceptedOptions: Object.freeze(acceptedOptions),
    confidence: extracted ? FALLBACK_CONFIDENCE : 0,
  });
}
