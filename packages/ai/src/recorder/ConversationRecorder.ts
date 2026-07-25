/**
 * PT-012 — Conversation Recorder (pilot validation).
 *
 * Passive audit trail of full conversation turns for debug / replay.
 * Never mutates Runtime, Memory, or pipeline results.
 * Completely no-ops when disabled.
 */

import type {
  ConversationExport,
  ConversationRecord,
} from "./models/ConversationRecord";

export type ConversationRecorderOptions = {
  readonly enabled?: boolean;
  readonly sessionId?: string;
  readonly conversationId?: string;
};

export class ConversationRecorder {
  private readonly enabled: boolean;
  private readonly sessionId: string;
  private readonly conversationId: string;
  private readonly records: ConversationRecord[] = [];

  constructor(options: ConversationRecorderOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.sessionId = options.sessionId ?? "unknown";
    this.conversationId = options.conversationId ?? this.sessionId;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  record(entry: ConversationRecord): void {
    if (!this.enabled) {
      return;
    }
    this.records.push(Object.freeze({ ...entry }));
  }

  getRecords(): readonly ConversationRecord[] {
    return this.records;
  }

  getLastRecord(): ConversationRecord | null {
    return this.records[this.records.length - 1] ?? null;
  }

  clear(): void {
    this.records.length = 0;
  }

  /** One conversation = one exportable JSON document. */
  toExport(): ConversationExport {
    return Object.freeze({
      sessionId: this.sessionId,
      conversationId: this.conversationId,
      exportedAt: Date.now(),
      messageCount: this.records.length,
      records: Object.freeze([...this.records]),
    });
  }

  /** Deterministic JSON for replay / regression / anonymized sharing. */
  exportJSON(pretty = true): string {
    return JSON.stringify(this.toExport(), null, pretty ? 2 : undefined);
  }
}

export function createConversationRecorder(
  options?: ConversationRecorderOptions,
): ConversationRecorder {
  return new ConversationRecorder(options);
}

export function createDisabledConversationRecorder(
  options: Omit<ConversationRecorderOptions, "enabled"> = {},
): ConversationRecorder {
  return new ConversationRecorder({ ...options, enabled: false });
}
