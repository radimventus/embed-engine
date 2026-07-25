/**
 * PT-013 — Shared helpers for reading ResolvedMemory / object attributes.
 */

import type { ResolvedMemory } from "../../memory/models/ResolvedMemory";
import type { MemoryValue } from "../../prompt/models/DecisionMemory";

export function findMemoryValue(
  memory: ResolvedMemory,
  bucket:
    | "facts"
    | "preferences"
    | "constraints"
    | "goals"
    | "concerns"
    | "acceptedOptions"
    | "rejectedOptions",
  key: string,
): MemoryValue | undefined {
  return memory[bucket].find((item) => item.key === key)?.value;
}

export function asNumber(value: MemoryValue | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function asString(value: MemoryValue | undefined): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

export function readObjectNumber(
  attributes: Readonly<Record<string, string | number | boolean | null>>,
  key: string,
): number | null {
  const value = attributes[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function readObjectString(
  attributes: Readonly<Record<string, string | number | boolean | null>>,
  key: string,
): string | null {
  const value = attributes[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}
