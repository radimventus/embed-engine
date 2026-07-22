import type { InterpretationRule, InterpretationRuleset } from "./InterpretationRule";

function freezeRule(rule: InterpretationRule): InterpretationRule {
  return Object.freeze({
    id: rule.id,
    kind: rule.kind,
    priority: rule.priority,
    enabled: rule.enabled,
    version: rule.version,
    config: Object.freeze({ ...rule.config }) as InterpretationRule["config"],
  });
}

export function createInterpretationRuleset(input: {
  readonly id: string;
  readonly version: number;
  readonly rules: readonly InterpretationRule[];
}): InterpretationRuleset {
  return Object.freeze({
    id: input.id,
    version: input.version,
    rules: Object.freeze(input.rules.map(freezeRule)),
  });
}

/**
 * Default house Decision Session rules (CAP-HP-003.5).
 * Changing this ruleset (without changing Object Package) changes Experience meaning.
 */
export const DEFAULT_HOUSE_INTERPRETATION_RULES: InterpretationRuleset =
  createInterpretationRuleset({
    id: "house-session-default",
    version: 1,
    rules: [
      {
        id: "room-importance.default",
        kind: "room-importance",
        priority: 100,
        enabled: true,
        version: 1,
        config: {
          order: [
            "room-living",
            "room-kitchen",
            "room-bedroom",
            "room-children",
            "room-bath",
          ],
        },
      },
      {
        id: "hero-emphasis.default",
        kind: "hero-emphasis",
        priority: 100,
        enabled: true,
        version: 1,
        config: {
          defaultReason: "explore-house-structure",
          reasonsByRoomId: {
            "room-living": "primary-living-volume",
            "room-kitchen": "daily-workflow-core",
            "room-bedroom": "private-rest-zone",
            "room-bath": "service-wet-zone",
            "room-children": "flexible-secondary-space",
          },
        },
      },
      {
        id: "media-prioritization.default",
        kind: "media-prioritization",
        priority: 100,
        enabled: true,
        version: 1,
        config: {
          roleOrder: ["hero", "gallery", "video", "thumbnail", "document"],
          roleOrderByRoomId: {
            "room-living": ["video", "hero", "gallery", "thumbnail", "document"],
            "room-kitchen": ["hero", "gallery", "video", "thumbnail", "document"],
          },
        },
      },
      {
        id: "contextual-messaging.default",
        kind: "contextual-messaging",
        priority: 100,
        enabled: true,
        version: 1,
        config: {
          defaultMessages: ["inspect-layout", "compare-rooms"],
          messagesByRoomId: {
            "room-living": ["day-zone-openness", "family-gathering"],
            "room-kitchen": ["workflow-efficiency", "natural-light"],
            "room-bedroom": ["privacy", "morning-light"],
            "room-bath": ["finishes", "storage"],
            "room-children": ["flexibility", "growth"],
          },
          messagesByPriorityId: {
            price: "value-efficiency",
            garden: "outdoor-connection",
            space: "spatial-generosity",
          },
        },
      },
      {
        id: "recommendation-ordering.default",
        kind: "recommendation-ordering",
        priority: 100,
        enabled: true,
        version: 1,
        config: {
          highlightOrder: [
            "day-zone-openness",
            "family-gathering",
            "workflow-efficiency",
            "natural-light",
            "privacy",
            "morning-light",
            "finishes",
            "storage",
            "flexibility",
            "growth",
            "value-efficiency",
            "outdoor-connection",
            "spatial-generosity",
            "inspect-layout",
            "compare-rooms",
          ],
        },
      },
    ],
  });
