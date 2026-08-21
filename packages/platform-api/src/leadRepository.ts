import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { platformApiStatePath } from './platformApiConfig';

export type DurableLeadInput = {
  readonly leadId: string;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly source: 'EMBED';
  readonly intent: 'audit';
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
  };
  readonly consent: {
    readonly accepted: true;
    readonly acceptedAt: string;
    readonly privacyUrl: string;
    readonly privacyVersion: string;
  };
  readonly decisionSessionId?: string | null;
};

export type DurableLead = DurableLeadInput & {
  readonly status: 'accepted';
  readonly processingStatus: 'new' | 'accepted';
  readonly notificationStatus: 'pending';
  readonly decisionSessionId: string | null;
};

export type LeadScopeQuery = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string;
};

export type LeadAcceptInput = {
  readonly leadId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
};

export interface LeadRepository {
  create(input: DurableLeadInput): Promise<DurableLead>;
  getByIdempotencyKey(key: string): Promise<DurableLead | null>;
  list(query: LeadScopeQuery): Promise<readonly DurableLead[]>;
  accept(input: LeadAcceptInput): Promise<DurableLead>;
}

export class LeadAlreadyExistsError extends Error {
  constructor(readonly lead: DurableLead) {
    super('Lead already exists.');
  }
}

export class LeadNotFoundError extends Error {
  constructor() {
    super('Lead not found.');
  }
}

type LeadState = { readonly leads: readonly DurableLead[] };

function validate(input: DurableLeadInput): DurableLead {
  const decisionSessionId =
    typeof input.decisionSessionId === 'string' && input.decisionSessionId.trim().length > 0
      ? input.decisionSessionId.trim()
      : null;
  if (
    [input.leadId, input.idempotencyKey, input.companyId, input.projectId, input.houseId,
      input.contact.name, input.contact.email, input.consent.privacyUrl, input.consent.privacyVersion]
      .some((value) => value.trim().length === 0) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact.email) ||
    input.consent.accepted !== true ||
    !Number.isFinite(Date.parse(input.createdAt)) ||
    !Number.isFinite(Date.parse(input.consent.acceptedAt))
  ) {
    throw new Error('Invalid durable lead.');
  }
  return {
    ...input,
    createdAt: new Date(input.createdAt).toISOString(),
    companyId: input.companyId.trim(),
    projectId: input.projectId.trim(),
    houseId: input.houseId.trim(),
    contact: {
      name: input.contact.name.trim(),
      email: input.contact.email.trim().toLowerCase(),
      phone: input.contact.phone?.trim() || null,
    },
    consent: { ...input.consent, acceptedAt: new Date(input.consent.acceptedAt).toISOString() },
    decisionSessionId,
    status: 'accepted',
    processingStatus: 'new',
    notificationStatus: 'pending',
  };
}

export class FileLeadRepository implements LeadRepository {
  private mutation: Promise<void> = Promise.resolve();
  constructor(private readonly statePath = platformApiStatePath('leads.json')) {}

  async create(input: DurableLeadInput): Promise<DurableLead> {
    const lead = validate(input);
    return this.exclusively(async () => {
      const state = await this.read();
      const existing = state.leads.find((item) => item.idempotencyKey === lead.idempotencyKey);
      if (existing) throw new LeadAlreadyExistsError(existing);
      await this.write({ leads: [...state.leads, lead] });
      return lead;
    });
  }

  async getByIdempotencyKey(key: string): Promise<DurableLead | null> {
    return (await this.read()).leads.find((item) => item.idempotencyKey === key) ?? null;
  }

  async list(query: LeadScopeQuery): Promise<readonly DurableLead[]> {
    const companyId = query.companyId.trim();
    const projectId = query.projectId.trim();
    const houseId = query.houseId?.trim() ?? '';
    if (companyId.length === 0 || projectId.length === 0) {
      return [];
    }
    return (await this.read()).leads.filter(
      (item) =>
        item.companyId === companyId &&
        item.projectId === projectId &&
        (houseId.length === 0 || item.houseId === houseId),
    );
  }

  async accept(input: LeadAcceptInput): Promise<DurableLead> {
    const leadId = input.leadId.trim();
    const companyId = input.companyId.trim();
    const projectId = input.projectId.trim();
    const houseId = input.houseId.trim();
    if (
      leadId.length === 0 ||
      companyId.length === 0 ||
      projectId.length === 0 ||
      houseId.length === 0
    ) {
      throw new LeadNotFoundError();
    }
    return this.exclusively(async () => {
      const state = await this.read();
      const index = state.leads.findIndex(
        (item) =>
          item.leadId === leadId &&
          item.companyId === companyId &&
          item.projectId === projectId &&
          item.houseId === houseId,
      );
      if (index < 0) {
        throw new LeadNotFoundError();
      }
      const existing = state.leads[index]!;
      if (existing.processingStatus === 'accepted') {
        return existing;
      }
      const accepted: DurableLead = {
        ...existing,
        processingStatus: 'accepted',
      };
      const leads = [...state.leads];
      leads[index] = accepted;
      await this.write({ leads });
      return accepted;
    });
  }

  private async read(): Promise<LeadState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as LeadState;
      return {
        leads: Array.isArray(parsed.leads)
          ? parsed.leads.map((item) => ({
              ...item,
              decisionSessionId: item.decisionSessionId ?? null,
              processingStatus:
                item.processingStatus === 'accepted' ? 'accepted' : 'new',
            }))
          : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { leads: [] };
      throw error;
    }
  }

  private async write(state: LeadState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temporary = `${this.statePath}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, this.statePath);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try { return await operation(); } finally { release(); }
  }
}
