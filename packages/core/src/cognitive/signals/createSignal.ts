import type { Signal, SignalMetadata, SignalPayload } from "./Signal";
import type { SignalType } from "./SignalType";

export type CreateSignalInput = {
  readonly type: SignalType;
  readonly id?: string;
  readonly timestamp?: number;
  readonly payload?: SignalPayload;
  readonly metadata?: SignalMetadata;
};

let signalSequence = 0;

function nextSignalId(timestamp: number): string {
  signalSequence += 1;
  return `signal-${timestamp}-${signalSequence}`;
}

/**
 * Creates a valid immutable Signal.
 * Factory only — no dispatch, storage, or interpretation.
 */
export function createSignal(input: CreateSignalInput): Signal {
  const timestamp = input.timestamp ?? Date.now();
  const payload = input.payload ?? {};
  const metadata = input.metadata ?? {};

  return Object.freeze({
    id: input.id ?? nextSignalId(timestamp),
    type: input.type,
    timestamp,
    payload: Object.freeze({ ...payload }),
    metadata: Object.freeze({ ...metadata }),
  });
}
