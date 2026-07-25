/**
 * Launch Context — opaque entry metadata (EMB-01 / EDIC-01).
 * Non-Interpretive; Delivery attaches it for boundary use only.
 */
export type LaunchContext = {
    readonly hostId?: string;
    readonly hostKind?: string;
    readonly entryPoint?: string;
    readonly launcherId?: string;
    readonly referrer?: string;
    readonly campaign?: Readonly<Record<string, string>>;
};
/**
 * Experience presentation flags interpreted by Delivery (Builder-declared shape).
 */
export type ExperiencePresentationConfig = {
    readonly mode: "standalone" | "launcher" | "inline";
    readonly landingAnchorId: string;
    readonly showCloseAction: boolean;
};
export declare const LAUNCHER_DEFAULT_PRESENTATION: ExperiencePresentationConfig;
export declare const INLINE_DEFAULT_PRESENTATION: ExperiencePresentationConfig;
//# sourceMappingURL=presentation.d.ts.map