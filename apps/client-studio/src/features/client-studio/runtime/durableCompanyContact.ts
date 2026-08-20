import {
  applyDurableCompanyContacts,
  platformApiOrigin,
  type PublicCompanyContact,
} from '@embed-engine/platform-access';

function asPublicContact(
  companyId: string,
  body: Partial<PublicCompanyContact>,
): PublicCompanyContact {
  const present = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  return {
    companyId,
    displayName: present(body.displayName) ?? '',
    legalName: present(body.legalName),
    ico: present(body.ico),
    city: present(body.city),
    country: present(body.country),
    email: present(body.email),
    phone: present(body.phone),
  };
}

export async function hydrateDurableCompanyContact(
  companyId: string,
  signal?: AbortSignal,
): Promise<void> {
  const normalized = companyId.trim();
  if (normalized.length === 0) return;

  try {
    const response = await fetch(
      `${platformApiOrigin().replace(/\/$/, '')}/public/companies/${encodeURIComponent(normalized)}/contact`,
      { signal },
    );
    if (!response.ok) return;
    const body = (await response.json()) as Partial<PublicCompanyContact>;
    applyDurableCompanyContacts([asPublicContact(normalized, body)]);
  } catch {
    // Fail closed — missing overlay leaves public contact empty.
  }
}
