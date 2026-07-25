/**
 * PT-007 — AnalyzerProvider.
 *
 * Uses LLM Foundation for structured extraction.
 * Falls back to deterministic rules when LLM output is unusable.
 * Never produces user-facing chat replies.
 */

import { createSystemPrompt } from "../../models/SystemPrompt";
import type { ChatRequest } from "../../models/ChatRequest";
import type { LLMProvider } from "../../providers/LLMProvider";
import { emptyDecisionMemory } from "../../prompt/models/DecisionMemory";
import { emptyKnowledgeContext } from "../../prompt/models/KnowledgeContext";
import { deterministicAnalyze } from "../deterministicFallback";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "../models/AnalysisRequest";
import { emptyAnalysisResult } from "../models/AnalysisRequest";
import type { MemoryItem } from "../../prompt/models/DecisionMemory";

export const ANALYZER_SYSTEM_PROMPT = [
  "Extrahuj pouze rozhodovací informace.",
  "Nevysvětluj.",
  "Neodpovídej uživateli.",
  "Vrať pouze strukturovaná data jako JSON objekt s poli:",
  "facts, preferences, constraints, goals, concerns, rejectedOptions, acceptedOptions, confidence.",
  "Každá položka v polích je { \"key\": string, \"value\": string | number | boolean }.",
  "confidence je číslo 0..1.",
].join(" ");

export type AnalyzerProviderOptions = {
  readonly llm: LLMProvider;
  /** When true, skip LLM and use deterministic rules only. */
  readonly deterministicOnly?: boolean;
};

export interface AnalyzerProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}

export class LlmAnalyzerProvider implements AnalyzerProvider {
  private readonly llm: LLMProvider;
  private readonly deterministicOnly: boolean;

  constructor(options: AnalyzerProviderOptions) {
    this.llm = options.llm;
    this.deterministicOnly = options.deterministicOnly ?? false;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    if (this.deterministicOnly) {
      return deterministicAnalyze(request.message);
    }

    try {
      const response = await this.llm.chat(toAnalyzerChatRequest(request));
      const parsed = parseAnalysisContent(response.content);
      if (parsed !== null) {
        return parsed;
      }
    } catch {
      // Fall through to deterministic path.
    }

    return deterministicAnalyze(request.message);
  }
}

export function createAnalyzerProvider(
  options: AnalyzerProviderOptions,
): AnalyzerProvider {
  return new LlmAnalyzerProvider(options);
}

function toAnalyzerChatRequest(request: AnalysisRequest): ChatRequest {
  const recent = request.recentMessages ?? [];
  return {
    sessionId: `analyze:${hashMessage(request.message)}`,
    systemPrompt: createSystemPrompt(ANALYZER_SYSTEM_PROMPT),
    context: {
      decision: request.decision,
      object: {
        objectId: null,
        reference: null,
        title: null,
        attributes: {},
        knowledge: emptyKnowledgeContext(),
        mediaReferences: [],
      },
      conversation: {
        sessionId: "analyzer",
        turnCount: recent.length + 1,
        recentMessages: recent,
      },
      memory: emptyDecisionMemory(),
      knowledge: emptyKnowledgeContext(),
    },
    messages: [
      ...recent.map((message) =>
        Object.freeze({ role: message.role, content: message.content }),
      ),
      Object.freeze({
        role: "user" as const,
        content: request.message,
      }),
    ],
  };
}

function hashMessage(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i += 1) {
    hash = (hash * 31 + message.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function parseAnalysisContent(content: string): AnalysisResult | null {
  const jsonText = extractJsonObject(content);
  if (jsonText === null) {
    return null;
  }

  try {
    const raw = JSON.parse(jsonText) as Record<string, unknown>;
    return normalizeAnalysisResult(raw);
  } catch {
    return null;
  }
}

function extractJsonObject(content: string): string | null {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return null;
}

function normalizeAnalysisResult(
  raw: Record<string, unknown>,
): AnalysisResult | null {
  const confidenceRaw = raw.confidence;
  const confidence =
    typeof confidenceRaw === "number" && Number.isFinite(confidenceRaw)
      ? Math.min(1, Math.max(0, confidenceRaw))
      : 0.5;

  const result = Object.freeze({
    facts: Object.freeze(normalizeItems(raw.facts)),
    preferences: Object.freeze(normalizeItems(raw.preferences)),
    constraints: Object.freeze(normalizeItems(raw.constraints)),
    goals: Object.freeze(normalizeItems(raw.goals)),
    concerns: Object.freeze(normalizeItems(raw.concerns)),
    rejectedOptions: Object.freeze(normalizeItems(raw.rejectedOptions)),
    acceptedOptions: Object.freeze(normalizeItems(raw.acceptedOptions)),
    confidence,
  });

  const total =
    result.facts.length +
    result.preferences.length +
    result.constraints.length +
    result.goals.length +
    result.concerns.length +
    result.rejectedOptions.length +
    result.acceptedOptions.length;

  if (total === 0 && confidence === 0) {
    return emptyAnalysisResult(0);
  }

  return result;
}

function normalizeItems(value: unknown): MemoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: MemoryItem[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const key = record.key;
    const itemValue = record.value;
    if (typeof key !== "string" || key.length === 0) {
      continue;
    }
    if (
      typeof itemValue !== "string" &&
      typeof itemValue !== "number" &&
      typeof itemValue !== "boolean"
    ) {
      continue;
    }
    items.push(Object.freeze({ key, value: itemValue }));
  }
  return items;
}
