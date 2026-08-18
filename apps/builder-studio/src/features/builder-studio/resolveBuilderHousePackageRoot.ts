export function resolveBuilderHousePackageRoot(
  input: {
    readonly packageRoot: string;
    readonly status: string;
  } | null,
  canonicalHouseContext: unknown,
): string | null {
  return canonicalHouseContext === null || input?.status === 'draft'
    ? (input?.packageRoot.trim() || null)
    : null;
}
