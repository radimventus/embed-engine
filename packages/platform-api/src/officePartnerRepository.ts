import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  canonicalCompanyIdForOfficePartner,
  InvalidOfficePartnerError,
  normalizeDurableOfficePartner,
  parseStoredOfficePartner,
  type DurableOfficePartner,
  type DurableOfficePartnerDraft,
} from '@embed-engine/platform-access';

import { platformApiStatePath } from './platformApiConfig';

export type DurableOfficePartnerInput = {
  readonly id: string;
  readonly draft: DurableOfficePartnerDraft;
};

export interface OfficePartnerRepository {
  list(): Promise<readonly DurableOfficePartner[]>;
  get(partnerId: string): Promise<DurableOfficePartner | null>;
  getByCompanyId(companyId: string): Promise<DurableOfficePartner | null>;
  create(input: DurableOfficePartnerInput): Promise<DurableOfficePartner>;
  update(input: DurableOfficePartnerInput): Promise<DurableOfficePartner>;
}

export class OfficePartnerNotFoundError extends Error {
  constructor(readonly partnerId: string) {
    super('Office Partner does not exist.');
    this.name = 'OfficePartnerNotFoundError';
  }
}

export class DuplicateOfficePartnerError extends Error {
  constructor(readonly partnerId: string) {
    super('Office Partner already exists.');
    this.name = 'DuplicateOfficePartnerError';
  }
}

type PartnerState = {
  readonly partners: readonly DurableOfficePartner[];
};

export class FileOfficePartnerRepository implements OfficePartnerRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    private readonly statePath = platformApiStatePath('office-partners.json'),
  ) {}

  async list(): Promise<readonly DurableOfficePartner[]> {
    return (await this.read()).partners;
  }

  async get(partnerId: string): Promise<DurableOfficePartner | null> {
    const normalized = partnerId.trim();
    if (normalized.length === 0) return null;
    return (
      (await this.read()).partners.find((item) => item.id === normalized) ?? null
    );
  }

  async getByCompanyId(companyId: string): Promise<DurableOfficePartner | null> {
    const canonical = canonicalCompanyIdForOfficePartner(companyId);
    if (canonical.length === 0) return null;
    return (
      (await this.read()).partners.find(
        (item) => item.companyId === canonical,
      ) ?? null
    );
  }

  async create(input: DurableOfficePartnerInput): Promise<DurableOfficePartner> {
    const partner = normalizeDurableOfficePartner({
      id: input.id,
      draft: input.draft,
    });
    return this.exclusively(async () => {
      const state = await this.read();
      if (state.partners.some((item) => item.id === partner.id)) {
        throw new DuplicateOfficePartnerError(partner.id);
      }
      if (state.partners.some((item) => item.companyId === partner.companyId)) {
        throw new DuplicateOfficePartnerError(partner.id);
      }
      await this.write({ partners: [...state.partners, partner] });
      return partner;
    });
  }

  async update(input: DurableOfficePartnerInput): Promise<DurableOfficePartner> {
    return this.exclusively(async () => {
      const state = await this.read();
      const previous =
        state.partners.find((item) => item.id === input.id.trim()) ?? null;
      if (previous === null) {
        throw new OfficePartnerNotFoundError(input.id);
      }
      const partner = normalizeDurableOfficePartner({
        id: previous.id,
        draft: input.draft,
        previous,
      });
      if (
        state.partners.some(
          (item) =>
            item.id !== partner.id && item.companyId === partner.companyId,
        )
      ) {
        throw new DuplicateOfficePartnerError(partner.id);
      }
      await this.write({
        partners: state.partners.map((item) =>
          item.id === partner.id ? partner : item,
        ),
      });
      return partner;
    });
  }

  private async read(): Promise<PartnerState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as {
        partners?: unknown;
      };
      const partners = Array.isArray(parsed.partners)
        ? parsed.partners.flatMap((item) => {
            const stored = parseStoredOfficePartner(item);
            return stored === null ? [] : [stored];
          })
        : [];
      return { partners };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { partners: [] };
      }
      throw error;
    }
  }

  private async write(state: PartnerState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });
    const temporary = `${this.statePath}.tmp`;
    await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
    await rename(temporary, this.statePath);
  }

  private async exclusively<T>(operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const previous = this.mutation;
    this.mutation = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

export { InvalidOfficePartnerError };
