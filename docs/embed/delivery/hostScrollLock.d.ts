/**
 * Host scroll lock / restore for Launcher Mode overlay (EDL-01 / LRI-01).
 */
export type HostScrollSnapshot = {
    readonly scrollX: number;
    readonly scrollY: number;
    readonly bodyOverflow: string;
    readonly htmlOverflow: string;
};
export declare function captureHostScroll(): HostScrollSnapshot;
export declare function lockHostScroll(snapshot: HostScrollSnapshot): void;
export declare function unlockHostScroll(snapshot: HostScrollSnapshot): void;
//# sourceMappingURL=hostScrollLock.d.ts.map