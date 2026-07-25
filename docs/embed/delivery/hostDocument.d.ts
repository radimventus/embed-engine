/**
 * Safe Host document helpers for Delivery Layer mount / overlay.
 * Partner CMS pages may lack `body` briefly or omit `ParentNode.append`.
 */
export declare function resolveHostMountParent(): HTMLElement;
export declare function resolveHostHead(): HTMLElement;
/**
 * Append children with `appendChild` for broad Host / WebView compatibility.
 * Avoids `ParentNode.append`, which some partner environments do not provide.
 */
export declare function appendNodes(parent: Node, ...nodes: readonly Node[]): void;
//# sourceMappingURL=hostDocument.d.ts.map