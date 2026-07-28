import type { IngestAnalyticsInput } from '../../model';

export type AnonymizedLearningPayload = {
  readonly snapshotId: string;
  readonly sessionId: string;
  readonly storyRef: string | null;
  readonly events: readonly {
    readonly type: string;
    readonly timestamp: string;
    readonly source: string;
    readonly note: string;
    readonly moveRef: string | null;
    readonly durationMs: number | null;
  }[];
  readonly metrics: readonly {
    readonly name: string;
    readonly value: number;
    readonly unit: string;
  }[];
  readonly completed: boolean;
  readonly title: string;
};

/**
 * LearningAnonymizer (EPIC-BLD-22).
 * Strips session/visitor identifiers — no AI.
 */
export type LearningAnonymizer = {
  anonymize(input: IngestAnalyticsInput): AnonymizedLearningPayload;
  stripIdentifiers(value: string): string;
  validatePrivacy(payload: AnonymizedLearningPayload): readonly string[];
};

const IDENTIFIER_PATTERNS = [
  /session-[a-z0-9-]+/gi,
  /analytics-session-[a-z0-9-]+/gi,
  /runtime-[a-z0-9-]+/gi,
  /story-[a-z0-9-]+/gi,
  /behavior-eval-[a-z0-9-]+/gi,
  /object-[a-z0-9-]+/gi,
  /harmony-?\d+/gi,
];

export function createLearningAnonymizer(): LearningAnonymizer {
  const stripIdentifiers = (value: string): string => {
    let next = value;
    for (const pattern of IDENTIFIER_PATTERNS) {
      next = next.replace(pattern, '[redacted]');
    }
    return next;
  };

  return {
    stripIdentifiers,

    anonymize(input) {
      const sessionToken = stripIdentifiers(input.sessionId);
      const snapshotToken = stripIdentifiers(input.snapshotId);
      const storyRef =
        input.storyId.trim() === ''
          ? null
          : stripIdentifiers(input.storyId);

      return {
        snapshotId: snapshotToken,
        sessionId: sessionToken,
        storyRef,
        title: stripIdentifiers(input.title?.trim() || 'Learning Record'),
        completed: input.completed,
        events: input.events.map((event) => ({
          type: event.type,
          timestamp: event.timestamp,
          source: event.source,
          note: stripIdentifiers(event.note),
          moveRef:
            event.moveId === null ? null : stripIdentifiers(event.moveId),
          durationMs: event.durationMs,
        })),
        metrics: input.metrics.map((metric) => ({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
        })),
      };
    },

    validatePrivacy(payload) {
      const issues: string[] = [];
      const blob = JSON.stringify(payload);
      if (/session-[a-z0-9-]+/i.test(blob) && !blob.includes('[redacted]')) {
        issues.push('Possible raw session identifier retained.');
      }
      if (/object-[a-z0-9-]+/i.test(blob)) {
        issues.push('Possible object identifier retained.');
      }
      return issues;
    },
  };
}
