import type { SignalType } from "./SignalType";

/** Opaque Signal payload. */
export type SignalPayload = Readonly<Record<string, unknown>>;

/** Opaque Signal metadata. */
export type SignalMetadata = {
  readonly source?: string;
};

/**
 * Meaningful decision event.
 * Immutable domain object — not a Runtime, DOM, or React event.
 */
export type Signal = {
  readonly id: string;
  readonly type: SignalType;
  readonly timestamp: number;
  readonly payload: SignalPayload;
  readonly metadata: SignalMetadata;
};
