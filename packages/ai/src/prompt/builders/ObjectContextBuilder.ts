/**
 * PT-005 — ObjectContextBuilder.
 * Structured object data only — no prose invention.
 */

import type { ObjectContext } from "../../models/PromptContext";
import {
  emptyKnowledgeContext,
  type KnowledgeContext,
} from "../models/KnowledgeContext";

export type ObjectContextInput = {
  readonly objectId?: string | null;
  readonly reference?: string | null;
  readonly title?: string | null;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly knowledge?: KnowledgeContext;
  readonly mediaReferences?: readonly string[];
};

export function buildObjectContext(input: ObjectContextInput = {}): ObjectContext {
  const attributes = input.attributes ?? {};
  const sortedKeys = Object.keys(attributes).sort();
  const sortedAttributes: Record<string, string | number | boolean | null> = {};
  for (const key of sortedKeys) {
    sortedAttributes[key] = attributes[key] ?? null;
  }

  return Object.freeze({
    objectId: input.objectId ?? null,
    reference: input.reference ?? null,
    title: input.title ?? null,
    attributes: Object.freeze(sortedAttributes),
    knowledge: input.knowledge ?? emptyKnowledgeContext(),
    mediaReferences: Object.freeze([...(input.mediaReferences ?? [])]),
  });
}

/** Deterministic text block for PromptAssembler. */
export function formatObjectContextSection(object: ObjectContext): string {
  const lines = [
    "Object Context",
    `objectId: ${object.objectId ?? "null"}`,
    `reference: ${object.reference ?? "null"}`,
    `title: ${object.title ?? "null"}`,
  ];

  const attrKeys = Object.keys(object.attributes);
  if (attrKeys.length === 0) {
    lines.push("attributes: (none)");
  } else {
    lines.push("attributes:");
    for (const key of attrKeys) {
      lines.push(`  ${key}: ${String(object.attributes[key])}`);
    }
  }

  if (object.knowledge.entries.length === 0) {
    lines.push("knowledge: (none)");
  } else {
    lines.push("knowledge:");
    for (const entry of object.knowledge.entries) {
      lines.push(`  - [${entry.id}] ${entry.text}`);
    }
  }

  if (object.mediaReferences.length === 0) {
    lines.push("mediaReferences: (none)");
  } else {
    lines.push("mediaReferences:");
    for (const ref of object.mediaReferences) {
      lines.push(`  - ${ref}`);
    }
  }

  return lines.join("\n");
}
