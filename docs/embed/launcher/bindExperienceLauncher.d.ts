/**
 * Experience Launcher — host entry surface (ELA-01).
 *
 * Accepts user activation, builds Launch Request, hands off to Delivery.
 * Does not create Runtime, mount Studio, or own Reveal.
 */
import { type LauncherArmedSession } from "../delivery/launchExperience";
import { type LaunchContext } from "../delivery/presentation";
export type BindExperienceLauncherOptions = {
    readonly trigger?: HTMLElement;
    /** Partner slot for Embed Hero projection (PT-EMBED-01). */
    readonly heroHost?: HTMLElement;
    readonly objectId?: string;
    readonly assetBase?: string;
    readonly launchContext?: LaunchContext;
};
/**
 * Bind a host CTA (and optional Embed Hero) so activation → Launch Request → Delivery.
 */
export declare function bindExperienceLauncher(options: BindExperienceLauncherOptions): LauncherArmedSession;
//# sourceMappingURL=bindExperienceLauncher.d.ts.map