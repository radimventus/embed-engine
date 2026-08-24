export type PartnerEmbedSnippetInput = {
  readonly houseId: string;
  readonly assetBase?: string;
  readonly targetId?: string;
  readonly cacheBust?: string;
  readonly aiDeliveryUrl?: string;
};

export declare function buildOfficialPartnerSnippet(
  input: PartnerEmbedSnippetInput,
): string;
