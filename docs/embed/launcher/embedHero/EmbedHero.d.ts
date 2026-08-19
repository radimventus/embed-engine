export type EmbedHeroProps = {
    readonly assetBase?: string;
    readonly houseId: string;
    readonly isReferenceHouse: boolean;
    /** Called when the primary CTA is activated (opens Experience). */
    readonly onOpenExperience: () => void;
};
/**
 * Partner-page projection of Hero Reference Implementation v1.0 (PT-EMBED-01).
 * Projects Client Studio Hero identity — do not redesign (PT-HERO-FREEZE-01).
 * SSOT: docs/architecture/HERO-V1-FREEZE.md
 * CTA opens Experience — does not scroll inside Studio.
 */
export declare function EmbedHero({ assetBase, houseId, isReferenceHouse, onOpenExperience, }: EmbedHeroProps): import("react").JSX.Element;
//# sourceMappingURL=EmbedHero.d.ts.map