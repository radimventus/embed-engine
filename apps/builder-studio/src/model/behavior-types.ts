/**
 * Behavior Engine Foundation (EPIC-BLD-20).
 * Advisory layer over Runtime Session — never mutates Story/Session, no AI.
 */

export type BehaviorTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type BehaviorSignalType =
  | 'MoveEntered'
  | 'MoveExited'
  | 'PauseDetected'
  | 'ResumeDetected'
  | 'UserAction'
  | 'Timeout';

export type BehaviorSignal = {
  readonly id: string;
  readonly type: BehaviorSignalType;
  readonly source: string;
  readonly timestamp: string;
  readonly payload: {
    readonly moveId: string | null;
    readonly note: string;
  };
  readonly metadata: {
    readonly sessionId: string;
  };
};

export type BehaviorActionType =
  | 'Continue'
  | 'Suggest'
  | 'Highlight'
  | 'Wait'
  | 'Skip';

export type BehaviorAction = {
  readonly id: string;
  readonly type: BehaviorActionType;
  readonly priority: number;
  readonly reason: string;
  readonly target: string | null;
  readonly metadata: {
    readonly strategyId: string;
    readonly signalId: string | null;
  };
};

export type BehaviorContext = {
  readonly sessionId: string;
  readonly currentMove: string | null;
  readonly history: readonly {
    readonly moveId: string | null;
    readonly action: string;
    readonly timestamp: string;
  }[];
  readonly signals: readonly BehaviorSignal[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type BehaviorEvaluation = {
  readonly id: string;
  readonly sessionId: string;
  readonly context: BehaviorContext;
  readonly actions: readonly BehaviorAction[];
  readonly strategyId: string;
  readonly timestamps: BehaviorTimestamps;
};

export type EvaluateBehaviorInput = {
  readonly sessionId: string;
  readonly currentMove: string | null;
  readonly history: readonly {
    readonly moveId: string | null;
    readonly action: string;
    readonly timestamp: string;
  }[];
  readonly signals?: readonly BehaviorSignal[];
  readonly title?: string;
};

export type BehaviorEventType =
  | 'BehaviorEvaluated'
  | 'BehaviorSignalReceived'
  | 'BehaviorActionProposed';

export type BehaviorEvent = {
  readonly eventId: string;
  readonly type: BehaviorEventType;
  readonly sessionId: string;
  readonly evaluationId: string | null;
  readonly signalId: string | null;
  readonly actionId: string | null;
  readonly at: string;
  readonly message: string;
};
