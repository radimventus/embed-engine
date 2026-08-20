import type { PublicCompanyContact } from '../partner/publicCompanyContact';

const overlayByCompanyId = new Map<string, PublicCompanyContact>();

export function applyDurableCompanyContacts(
  contacts: readonly PublicCompanyContact[],
): void {
  overlayByCompanyId.clear();
  for (const contact of contacts) {
    const companyId = contact.companyId.trim();
    if (companyId.length === 0) continue;
    overlayByCompanyId.set(companyId, contact);
  }
}

export function resetDurableCompanyContacts(): void {
  overlayByCompanyId.clear();
}

export function durableCompanyContact(
  companyId: string,
): PublicCompanyContact | undefined {
  const normalized = companyId.trim();
  if (normalized.length === 0) return undefined;
  return overlayByCompanyId.get(normalized);
}
