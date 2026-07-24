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
            "living-room",
            "kitchen",
            "bedroom",
            "children-room",
            "bathroom",
            // Legacy Object Package ids (Runtime unit fixtures).
            "room-living",
            "room-kitchen",
            "room-bedroom",
            "room-children",
            "room-bath",
          ],
          boostBySignalKind: {
            "emphasize-space": [
              "living-room",
              "children-room",
              "room-living",
              "room-children",
            ],
            "emphasize-outdoor": [
              "living-room",
              "kitchen",
              "room-living",
              "room-kitchen",
            ],
            "emphasize-privacy": [
              "bedroom",
              "bathroom",
              "room-bedroom",
              "room-bath",
            ],
            "emphasize-value": [
              "kitchen",
              "living-room",
              "room-kitchen",
              "room-living",
            ],
          },
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
            "living-room": "primary-living-volume",
            kitchen: "daily-workflow-core",
            bedroom: "private-rest-zone",
            bathroom: "service-wet-zone",
            "children-room": "flexible-secondary-space",
            "room-living": "primary-living-volume",
            "room-kitchen": "daily-workflow-core",
            "room-bedroom": "private-rest-zone",
            "room-bath": "service-wet-zone",
            "room-children": "flexible-secondary-space",
          },
          reasonBySignalKind: {
            "emphasize-value": "value-led-exploration",
            "emphasize-outdoor": "outdoor-led-exploration",
            "emphasize-space": "space-led-exploration",
            "emphasize-privacy": "privacy-led-exploration",
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
            "living-room": ["video", "hero", "gallery", "thumbnail", "document"],
            kitchen: ["hero", "gallery", "video", "thumbnail", "document"],
            "room-living": ["video", "hero", "gallery", "thumbnail", "document"],
            "room-kitchen": ["hero", "gallery", "video", "thumbnail", "document"],
          },
          roleOrderBySignalKind: {
            "emphasize-outdoor": [
              "gallery",
              "hero",
              "video",
              "thumbnail",
              "document",
            ],
            "emphasize-space": [
              "video",
              "gallery",
              "hero",
              "thumbnail",
              "document",
            ],
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
            "living-room": ["day-zone-openness", "family-gathering"],
            kitchen: ["workflow-efficiency", "natural-light"],
            bedroom: ["privacy", "morning-light"],
            bathroom: ["finishes", "storage"],
            "children-room": ["flexibility", "growth"],
            "room-living": ["day-zone-openness", "family-gathering"],
            "room-kitchen": ["workflow-efficiency", "natural-light"],
            "room-bedroom": ["privacy", "morning-light"],
            "room-bath": ["finishes", "storage"],
            "room-children": ["flexibility", "growth"],
          },
          messagesBySignalKind: {
            "emphasize-value": "value-efficiency",
            "emphasize-outdoor": "outdoor-connection",
            "emphasize-space": "spatial-generosity",
            "emphasize-privacy": "privacy",
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
