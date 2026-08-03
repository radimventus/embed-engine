/**
 * OF-14A — CONIS Workspace Host detection (operator entry only).
 * Partner Embed Host never sets this flag.
 */

export function isConisWorkspaceHost(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.dataset.conisWorkspaceHost === '1'
  );
}
