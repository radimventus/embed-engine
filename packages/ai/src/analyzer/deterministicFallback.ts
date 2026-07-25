/**
 * PT-007 — Deterministic analysis fallback (no LLM required).
 * Extracts structured decision signals from common Czech / EN patterns.
 */

import type { AnalysisResult } from "./models/AnalysisRequest";
import type { MemoryItem } from "../prompt/models/DecisionMemory";

const FALLBACK_CONFIDENCE = 0.72;

function item(key: string, value: string | number | boolean): MemoryItem {
  return Object.freeze({ key, value });
}

/**
 * Rule-based extraction for pilot / offline / parse-failure paths.
 */
export function deterministicAnalyze(message: string): AnalysisResult {
  const text = message.trim();
  const lower = text.toLowerCase();

  const facts: MemoryItem[] = [];
  const preferences: MemoryItem[] = [];
  const constraints: MemoryItem[] = [];
  const goals: MemoryItem[] = [];
  const concerns: MemoryItem[] = [];
  const rejectedOptions: MemoryItem[] = [];
  const acceptedOptions: MemoryItem[] = [];

  // "dvě děti" / "2 děti" → household of 4 (2 adults + 2 children) per PT-007 scenario.
  if (
    /\b(dvě|dve|2)\s+dět/i.test(text) ||
    /\b(two|2)\s+(kids|children)\b/i.test(lower)
  ) {
    facts.push(item("familySize", 4));
  }

  // Budget: "6,5 milionu" / "6.5 million" / "6500000"
  const budgetMillion = text.match(
    /(\d+[.,]\d+)\s*milion/i,
  );
  const budgetPlain = text.match(
    /\b(rozpočet|budget)\b[^0-9]{0,24}(\d[\d\s.,]{3,})\b/i,
  );
  if (budgetMillion) {
    const raw = budgetMillion[1]!.replace(",", ".");
    const millions = Number.parseFloat(raw);
    if (Number.isFinite(millions)) {
      constraints.push(item("budget", Math.round(millions * 1_000_000)));
    }
  } else if (budgetPlain) {
    const digits = budgetPlain[2]!.replace(/[\s.]/g, "").replace(",", "");
    const value = Number.parseInt(digits, 10);
    if (Number.isFinite(value)) {
      constraints.push(item("budget", value));
    }
  }

  // Reject heat pump
  const rejectsHeatPump =
    /(nechceme|nechci|nechce|without|don't want|do not want|no)\b[\s\S]{0,40}(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)/i.test(
      text,
    ) ||
    /(tepelné\s+čerpadlo|tepelne\s+cerpadlo|heat[\s-]?pump)\b[\s\S]{0,40}(nechceme|nechci|ne)/i.test(
      text,
    );
  if (rejectsHeatPump) {
    rejectedOptions.push(item("heating", "heat-pump"));
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
