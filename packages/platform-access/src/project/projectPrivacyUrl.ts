/**
 * Shared Project privacy URL validation.
 * Empty is allowed (lead capture stays fail-closed). Non-empty must be HTTPS.
 */

export function normalizeProjectPrivacyUrl(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error('Invalid project privacy URL.');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Invalid project privacy URL.');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Invalid project privacy URL.');
  }
  if (parsed.username !== '' || parsed.password !== '') {
    throw new Error('Invalid project privacy URL.');
  }
  return parsed.href;
}
