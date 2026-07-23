/**
 * Safe Host document helpers for Delivery Layer mount / overlay.
 * Partner CMS pages may lack `body` briefly or omit `ParentNode.append`.
 */

export function resolveHostMountParent(): HTMLElement {
  const body = document.body;
  if (body) {
    return body;
  }
  const root = document.documentElement;
  if (root) {
    return root;
  }
  throw new Error(
    "Embed: cannot attach Experience — document body is unavailable",
  );
}

export function resolveHostHead(): HTMLElement {
  const head = document.head;
  if (head) {
    return head;
  }
  return resolveHostMountParent();
}

/**
 * Append children with `appendChild` for broad Host / WebView compatibility.
 * Avoids `ParentNode.append`, which some partner environments do not provide.
 */
export function appendNodes(parent: Node, ...nodes: readonly Node[]): void {
  for (const node of nodes) {
    parent.appendChild(node);
  }
}
