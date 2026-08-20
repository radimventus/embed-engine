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
};

export type DurableLead = DurableLeadInput & {
  readonly status: 'accepted';
  readonly notificationStatus: 'pending';
};

export interface LeadRepository {
  create(input: DurableLeadInput): Promise<DurableLead>;
  getByIdempotencyKey(key: string): Promise<DurableLead | null>;
}

export class LeadAlreadyExistsError extends Error {
  constructor(readonly lead: DurableLead) {
    super('Lead already exists.');
  }
}

type LeadState = { readonly leads: readonly DurableLead[] };

function validate(input: DurableLeadInput): DurableLead {
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
    status: 'accepted',
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

  private async read(): Promise<LeadState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as LeadState;
      return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
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
