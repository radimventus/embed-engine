/**
 * AI Context (EPIC-BLD-13).
 * Temporary composed context for future AI — no LLM, prompts, or Runtime.
 * AI never reads Object / Knowledge / Decision packages directly.
 */

export type AIContextTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AIContextMetadata = {
  readonly title: string;
  readonly description: string;
  readonly objectId: string;
  readonly projectId: string;
  readonly status: 'Empty' | 'Built' | 'Cleared';
};

export type ContextFragmentType =
  | 'object'
  | 'experience'
  | 'knowledge'
  | 'decision';

export type ContextFragment = {
  readonly id: string;
  readonly type: ContextFragmentType;
  readonly priority: number;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata: {
    readonly source: string;
    readonly notes: string;
  };
};

/**
 * Temporary Context Package — session only, never persisted.
 */
export type AIContextPackage = {
  readonly id: string;
  readonly version: string;
  readonly objectContext: ContextFragment | null;
  readonly experienceContext: ContextFragment | null;
  readonly knowledgeContext: ContextFragment | null;
  readonly decisionContext: ContextFragment | null;
  readonly fragments: readonly ContextFragment[];
  readonly metadata: AIContextMetadata;
  readonly timestamps: AIContextTimestamps;
};

export type BuildAIContextInput = {
  readonly objectId: string;
  readonly projectId: string;
  readonly title?: string;
  readonly objectPackage: {
    readonly objectId: string;
    readonly projectId: string;
    readonly version: string;
    readonly metadata: {
      readonly name: string;
      readonly objectType: string;
      readonly location: string;
      readonly status: string;
      readonly description: string;
      readonly tags: readonly string[];
    };
    readonly modules: readonly string[];
  };
  readonly experience: {
    readonly experienceId: string;
    readonly version: string;
    readonly metadata: {
      readonly title: string;
      readonly description: string;
    };
    readonly scenes: readonly {
      readonly sceneId: string;
      readonly title: string;
      readonly modules: readonly string[];
    }[];
    readonly navigation: {
      readonly defaultScene: string | null;
      readonly order: readonly string[];
    };
  } | null;
  readonly knowledge: {
    readonly knowledgeId: string;
    readonly version: string;
    readonly facts: readonly {
      readonly id: string;
      readonly title: string;
      readonly value: string;
      readonly category: string;
    }[];
    readonly entities: readonly {
      readonly id: string;
      readonly type: string;
      readonly label: string;
    }[];
    readonly faqs: readonly {
      readonly id: string;
      readonly question: string;
      readonly answer: string;
    }[];
    readonly documents: readonly {
      readonly id: string;
      readonly title: string;
      readonly type: string;
    }[];
  } | null;
  readonly decision: {
    readonly id: string;
    readonly version: string;
    readonly decisionRules: readonly {
      readonly id: string;
      readonly condition: string;
      readonly outcome: string;
      readonly priority: number;
      readonly weight: number;
    }[];
    readonly decisionSignals: readonly {
      readonly id: string;
      readonly source: string;
      readonly type: string;
      readonly label: string;
      readonly importance: number;
    }[];
    readonly priorities: readonly string[];
    readonly strategies: readonly {
      readonly id: string;
      readonly title: string;
      readonly description: string;
      readonly targetSignals: readonly string[];
    }[];
  } | null;
};

export type ContextEventType =
  | 'ContextBuilt'
  | 'ContextRefreshed'
  | 'ContextCleared';

export type ContextEvent = {
  readonly eventId: string;
  readonly type: ContextEventType;
  readonly contextId: string;
  readonly objectId: string;
  readonly at: string;
  readonly message: string;
};
