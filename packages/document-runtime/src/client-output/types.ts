export type ClientOutputTrigger = 'HEADER' | 'AUDIT';
export type ClientOutputVariant = 'UNIVERSAL' | 'HAS_LAND' | 'SEEKING_LAND';

export type ClientOutputMedia = {
  readonly id: string;
  readonly url: string;
  readonly caption: string;
  /** Canonical presentation role captured in the reproducible snapshot. */
  readonly role?: 'cover' | 'exterior' | 'floorplan' | 'interior';
  /** Client-facing semantic label; never an asset filename or internal id. */
  readonly label?: string;
};

export type ClientOutputNarrative = {
  readonly title: string;
  readonly fact: string;
  readonly userImpact: string;
};

export type ClientOutputSnapshot = {
  readonly schemaVersion: 1;
  readonly capturedAt: string;
  readonly company: { readonly id: string; readonly name: string };
  readonly project: { readonly id: string; readonly name: string };
  readonly house: { readonly id: string; readonly name: string; readonly storeys: number };
  readonly knowledgeVersion: string;
  readonly variant: ClientOutputVariant;
  readonly priorities: readonly string[];
  readonly cover?: readonly ClientOutputMedia[];
  readonly exterior: readonly ClientOutputMedia[];
  readonly floorPlans: readonly ClientOutputMedia[];
  readonly interiors: readonly ClientOutputMedia[];
  readonly priorityNarratives: readonly ClientOutputNarrative[];
  readonly connectedTopics: readonly ClientOutputNarrative[];
  readonly blindspots: readonly ClientOutputNarrative[];
  readonly faq: readonly { readonly question: string; readonly answer: string }[];
  readonly plotAndProcess: readonly string[];
  readonly auditConclusion: string;
  readonly cta: string;
};
