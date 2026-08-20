/**
 * Project/partner Audit footer fields from the active Client runtime scope.
 * Public Partner projection only — never CRM contact person, role, or fixtures.
 */
export type ProjectFooterModel = {
  readonly legalName: string | null;
  readonly address: string | null;
  readonly ico: string | null;
  readonly phone: string | null;
  readonly email: string | null;
};

function present(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function projectFooterFromRuntime(input: {
  readonly companyName?: string | null;
  readonly legalName?: string | null;
  readonly city?: string | null;
  readonly country?: string | null;
  readonly ico?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
}): ProjectFooterModel {
  const legalName =
    present(input.legalName) ?? present(input.companyName);
  const city = present(input.city);
  const country = present(input.country);
  const address =
    city !== null && country !== null
      ? `${city}, ${country}`
      : city ?? country;

  return {
    legalName,
    address,
    ico: present(input.ico),
    phone: present(input.phone),
    email: present(input.email),
  };
}

export function projectFooterHasIdentity(model: ProjectFooterModel): boolean {
  return model.legalName !== null || model.address !== null || model.ico !== null;
}

export function projectFooterHasContact(model: ProjectFooterModel): boolean {
  return model.phone !== null || model.email !== null;
}

export function projectFooterHasContent(model: ProjectFooterModel): boolean {
  return projectFooterHasIdentity(model) || projectFooterHasContact(model);
}
