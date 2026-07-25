/**
 * Mount Embed Hero into a partner host slot (PT-EMBED-01).
 */
export type MountEmbedHeroOptions = {
    readonly host: HTMLElement;
    readonly assetBase?: string;
    readonly onOpenExperience: () => void;
};
export type MountedEmbedHero = {
    readonly host: HTMLElement;
    readonly dispose: () => void;
};
/**
 * Project Reference Hero into `host`. Injects Studio CSS (veil + utilities).
 */
export declare function mountEmbedHero(options: MountEmbedHeroOptions): MountedEmbedHero;
//# sourceMappingURL=mountEmbedHero.d.ts.map