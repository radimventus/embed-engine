/**
 * OF-02 / OF-10 / OF-11 — Partner Registry (Office authoring cache).
 * Server-backed Platform API is the durable SSOT after hydrate / save.
 */

import {
  canonicalCompanyIdForOfficePartner,
  createCanonicalPartner,
  createPlatformAccessAuthClient,
  getDefaultCompanyRegistry,
  syncCanonicalRegistryFromAuthority,
  type DurableOfficePartner,
} from "@embed-engine/platform-access";

import {
  defaultNextStep,
  type OfficePartner,
  type OfficePartnerDraft,
  type OfficePartnerStatus,
} from "./officePartnerModel";
import { appendOfficeEvent } from "./officeEventCatalog";
import { loadJson, removeJson } from "./officeLocalStore";
import { OFFICE_STORAGE_KEYS } from "./officeStorageKeys";
import { buildOfficeReferencePartner } from "./officeReferencePartner";
import {
  createOfficePartner,
  requestOfficePartners,
  saveOfficePartner,
} from "./requestOfficePartner";

const SEED_PARTNERS: readonly OfficePartner[] = Object.freeze([
  buildOfficeReferencePartner(),
]);

type PartnerPersistState = {
  readonly partners: readonly OfficePartner[];
  readonly idSeq: number;
};

function seedState(): PartnerPersistState {
  return {
    partners: SEED_PARTNERS.map((partner) => ({ ...partner })),
    idSeq: 100,
  };
}

function readLocalState(): PartnerPersistState | null {
  const stored = loadJson<PartnerPersistState | null>(
    OFFICE_STORAGE_KEYS.partners,
    null,
  );
  if (
    stored !== null &&
    Array.isArray(stored.partners) &&
    stored.partners.length > 0
  ) {
    return {
      partners: stored.partners.map((partner) => ({ ...partner })),
      idSeq: typeof stored.idSeq === "number" ? stored.idSeq : 100,
    };
  }
  return null;
}

function readState(): PartnerPersistState {
  return readLocalState() ?? seedState();
}

const initial = readState();
let partners: OfficePartner[] = initial.partners.map((partner) => ({
  ...partner,
}));
let serverAuthority = false;

export type PartnerQuickActionId =
  | "prepare-pilot"
  | "deliver-pilot"
  | "open-partner-environment"
  | "send-offer"
  | "confirm-order"
  | "record-payment"
  | "open-builder"
  | "suspend-partner"
  | "restore-partner"
  | "archive-partner";

function nowIso(): string {
  return new Date().toISOString();
}

function toOfficePartner(record: DurableOfficePartner): OfficePartner {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    nextStep: record.nextStep,
    company: { ...record.company },
    contact: { ...record.contact },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function replaceMemory(next: readonly OfficePartner[]): void {
  partners = next.map((partner) => ({ ...partner }));
}

function adoptAuthoritative(record: DurableOfficePartner): OfficePartner {
  const office = toOfficePartner(record);
  const index = partners.findIndex((partner) => partner.id === office.id);
  partners =
    index < 0
      ? [...partners, office]
      : partners.map((partner, i) => (i === index ? office : partner));
  return office;
}

function dropLocalPartnerAuthority(): void {
  removeJson(OFFICE_STORAGE_KEYS.partners);
  serverAuthority = true;
}

export function listPartners(): readonly OfficePartner[] {
  return [...partners].sort((a, b) => a.name.localeCompare(b.name, "cs"));
}

export function getPartner(id: string): OfficePartner | null {
  return partners.find((partner) => partner.id === id) ?? null;
}

export function createPartner(draft: OfficePartnerDraft): OfficePartner {
  const createdAt = nowIso();
  const canonicalPartner = createCanonicalPartner({ name: draft.name });
  const partner: OfficePartner = {
    id: canonicalPartner.companyId,
    name: draft.name.trim(),
    status: draft.status,
    nextStep: draft.nextStep.trim() || defaultNextStep(draft.status),
    company: {
      legalName: draft.company.legalName.trim() || draft.name.trim(),
      ico: draft.company.ico.trim(),
      streetAddress: '',
      city: draft.company.city.trim(),
      country: draft.company.country.trim() || "Česko",
    },
    contact: {
      name: draft.contact.name.trim(),
      email: draft.contact.email.trim(),
      phone: draft.contact.phone.trim(),
      role: draft.contact.role.trim(),
    },
    createdAt,
    updatedAt: createdAt,
  };
  partners = [...partners, partner];
  appendOfficeEvent({
    kind: "partner.created",
    label: "Partner vytvořen",
    detail: `${partner.name} · nový partner`,
    partnerId: partner.id,
  });
  return partner;
}

export function updatePartner(
  id: string,
  draft: OfficePartnerDraft,
): OfficePartner | null {
  const index = partners.findIndex((partner) => partner.id === id);
  if (index < 0) return null;
  const previous = partners[index]!;
  const updated: OfficePartner = {
    ...previous,
    name: draft.name.trim(),
    status: draft.status,
    nextStep: draft.nextStep.trim() || defaultNextStep(draft.status),
    company: {
      legalName: draft.company.legalName.trim() || draft.name.trim(),
      ico: draft.company.ico.trim(),
      streetAddress: '',
      city: draft.company.city.trim(),
      country: draft.company.country.trim() || "Česko",
    },
    contact: {
      name: draft.contact.name.trim(),
      email: draft.contact.email.trim(),
      phone: draft.contact.phone.trim(),
      role: draft.contact.role.trim(),
    },
    updatedAt: nowIso(),
  };
  partners = partners.map((partner, i) => (i === index ? updated : partner));
  appendOfficeEvent({
    kind: "partner.updated",
    label: "Partner upraven",
    detail: `${updated.name} · ${updated.nextStep}`,
    partnerId: updated.id,
  });
  return updated;
}

export function discardUnsavedPartner(id: string): void {
  partners = partners.filter((partner) => partner.id !== id);
}

export async function persistCreatedPartner(
  partner: OfficePartner,
): Promise<OfficePartner> {
  const registry = getDefaultCompanyRegistry();

  const company = registry.companies.find((item) => item.id === partner.id);

  const workspace = registry.workspaces.find(
    (item) => item.companyId === partner.id,
  );

  const tenantId = company?.tenantId;
  const tenant =
    tenantId === undefined
      ? undefined
      : registry.tenants.find((item) => item.id === tenantId);

  if (
    company === undefined ||
    workspace === undefined ||
    tenant === undefined
  ) {
    throw new Error("Canonical Partner není v klientském registru kompletní.");
  }

  const canonical =
    await createPlatformAccessAuthClient().persistCanonicalPartnerAuthority({
      tenant,
      company,
      workspace,
    });

  if (!canonical.ok) {
    throw new Error(canonical.error);
  }

  const saved = await createOfficePartner(
    partner.id,
    draftFromPartner(partner),
  );

  const sync = await syncCanonicalRegistryFromAuthority();

  if (!sync.ok) {
    throw new Error(sync.error);
  }

  const adopted = adoptAuthoritative(saved);
  dropLocalPartnerAuthority();
  return adopted;
}

export async function persistUpdatedPartner(
  partnerId: string,
  draft: OfficePartnerDraft,
): Promise<OfficePartner> {
  const saved = await saveOfficePartner(partnerId, draft);
  const adopted = adoptAuthoritative(saved);
  dropLocalPartnerAuthority();
  return adopted;
}

let hydrateInFlight: Promise<void> | null = null;

export async function hydrateOfficePartnersFromServer(): Promise<void> {
  if (hydrateInFlight !== null) {
    return hydrateInFlight;
  }
  hydrateInFlight = hydrateOfficePartnersFromServerOnce().finally(() => {
    hydrateInFlight = null;
  });
  return hydrateInFlight;
}

async function ensureOfficePartnerCanonicalAuthority(
  partner: OfficePartner,
): Promise<void> {
  const companyId =
    canonicalCompanyIdForOfficePartner(partner.id);

  let registry = getDefaultCompanyRegistry();
  let company = registry.companies.find(
    (item) => item.id === companyId,
  );
  let workspace = registry.workspaces.find(
    (item) => item.companyId === companyId,
  );
  const initialTenantId = company?.tenantId;
  let tenant =
    initialTenantId === undefined
      ? undefined
      : registry.tenants.find(
          (item) => item.id === initialTenantId,
        );

  if (
    company === undefined ||
    workspace === undefined ||
    tenant === undefined
  ) {
    const created = createCanonicalPartner({
      name: partner.name,
    });

    company = created.company;
    workspace = created.workspace;

    registry = getDefaultCompanyRegistry();
    tenant = registry.tenants.find(
      (item) => item.id === created.company.tenantId,
    );
  }

  if (
    company === undefined ||
    workspace === undefined ||
    tenant === undefined
  ) {
    throw new Error(
      `Canonical Partner authority is incomplete for ${partner.id}.`,
    );
  }

  const persisted =
    await createPlatformAccessAuthClient()
      .persistCanonicalPartnerAuthority({
        tenant,
        company,
        workspace,
      });

  if (!persisted.ok) {
    throw new Error(persisted.error);
  }
}

async function hydrateOfficePartnersFromServerOnce(): Promise<void> {
  const remote = await requestOfficePartners();
  if (remote.length > 0) {
    const remotePartners = remote.map(toOfficePartner);

    for (const partner of remotePartners) {
      await ensureOfficePartnerCanonicalAuthority(partner);
    }

    const sync =
      await syncCanonicalRegistryFromAuthority();

    if (!sync.ok) {
      throw new Error(sync.error);
    }

    replaceMemory(remotePartners);
    dropLocalPartnerAuthority();
    return;
  }

  const local = readLocalState();
  if (local === null) {
    return;
  }

  for (const partner of local.partners) {
    try {
      const saved = await saveOfficePartner(
        partner.id,
        draftFromPartner(partner),
      );
      adoptAuthoritative(saved);
    } catch {
      const created = await createOfficePartner(
        partner.id,
        draftFromPartner(partner),
      );
      adoptAuthoritative(created);
    }
  }
  const confirmed = await requestOfficePartners();
  if (confirmed.length > 0) {
    replaceMemory(confirmed.map(toOfficePartner));
    dropLocalPartnerAuthority();
  }
}

export function isOfficePartnerServerAuthority(): boolean {
  return serverAuthority;
}

export function applyPartnerQuickAction(
  id: string,
  actionId: PartnerQuickActionId,
): OfficePartner | null {
  const partner = getPartner(id);
  if (partner === null) return null;

  let status: OfficePartnerStatus = partner.status;
  let kind:
    "offer.sent" | "order.confirmed" | "payment.received" | "builder.opened" =
    "offer.sent";
  let label = "";
  let detail = "";

  switch (actionId) {
    case "prepare-pilot":
      return partner;
    case "deliver-pilot":
      return partner;
    case "open-partner-environment":
      return partner;
    case "send-offer":
      return partner;
    case "confirm-order":
      status = "order";
      kind = "order.confirmed";
      label = "Objednávka potvrzena";
      detail = `${partner.name} · objednávka potvrzena`;
      break;
    case "record-payment":
      status = "payment";
      kind = "payment.received";
      label = "Platba přijata";
      detail = `${partner.name} · platba evidována`;
      break;
    case "open-builder":
      status = "implementation";
      kind = "builder.opened";
      label = "Builder otevřen";
      detail = `${partner.name} · handoff do Builderu`;
      break;
    case "suspend-partner":
    case "restore-partner":
    case "archive-partner":
      return partner;
  }

  const updated: OfficePartner = {
    ...partner,
    status,
    nextStep: defaultNextStep(status),
    updatedAt: nowIso(),
  };
  partners = partners.map((entry) => (entry.id === id ? updated : entry));
  appendOfficeEvent({
    kind,
    label,
    detail,
    partnerId: updated.id,
  });
  return updated;
}

/** Test / reset helper — restores seed registry. */
export function resetPartnerRegistryForTests(): void {
  removeJson(OFFICE_STORAGE_KEYS.partners);
  const seeded = seedState();
  partners = seeded.partners.map((partner) => ({ ...partner }));
  serverAuthority = false;
}

export function emptyPartnerDraft(): OfficePartnerDraft {
  return {
    name: "",
    status: "lead",
    nextStep: defaultNextStep("lead"),
    company: {
      legalName: "",
      ico: "",
      streetAddress: '',
      city: "",
      country: "Česko",
    },
    contact: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  };
}

export function draftFromPartner(partner: OfficePartner): OfficePartnerDraft {
  return {
    name: partner.name,
    status: partner.status,
    nextStep: partner.nextStep,
    company: { ...partner.company },
    contact: { ...partner.contact },
  };
}
