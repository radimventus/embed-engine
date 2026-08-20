import { normalizeProjectPrivacyUrl } from '@embed-engine/platform-access';

export function parseProjectPrivacyUrlInput(
  value: string,
): { readonly ok: true; readonly privacyUrl: string | null } | { readonly ok: false; readonly error: string } {
  try {
    return { ok: true, privacyUrl: normalizeProjectPrivacyUrl(value) };
  } catch {
    return {
      ok: false,
      error: 'Zadejte platnou HTTPS adresu, nebo pole nechte prázdné.',
    };
  }
}
