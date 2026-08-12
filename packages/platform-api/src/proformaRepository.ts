import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { DurableOrder } from './orderRepository';
import { platformApiStatePath } from './platformApiConfig';

export const COMMERCIAL_PAYMENT_ACCOUNT = Object.freeze({
  accountNumber: '2303345128/2010',
  iban: 'CZ1520100000002303345128',
  bankName: 'Fio banka',
});

export type DurableProforma = {
  readonly proformaId: string;
  readonly number: string;
  readonly orderId: string;
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly bankAccount: typeof COMMERCIAL_PAYMENT_ACCOUNT;
  readonly spdPayload: string;
};

export type ProformaIssuance = {
  readonly proforma: DurableProforma;
  readonly created: boolean;
};

export interface ProformaRepository {
  issue(order: DurableOrder): Promise<ProformaIssuance>;
  getByOrderId(orderId: string): Promise<DurableProforma | null>;
  getByProformaId(proformaId: string): Promise<DurableProforma | null>;
}

type ProformaState = {
  readonly proformas: readonly DurableProforma[];
};

function defaultStatePath(): string {
  return platformApiStatePath('proformas.json');
}

export function variableSymbolFromOrderId(orderId: string): string {
  const digits = orderId.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-10);
  return orderId.replace(/[^0-9A-Z]/gi, '').slice(-10);
}

export function dueDateFromIssuedAt(issuedAt: string, days = 14): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function buildSpdQrPayload(input: {
  readonly iban: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly message: string;
}): string {
  const amount = input.amountCzk.toFixed(2);
  const message = input.message.replace(/[\r\n*]/g, ' ').slice(0, 60);
  return [
    'SPD*1.0',
    `ACC:${input.iban}`,
    `AM:${amount}`,
    'CC:CZK',
    `X-VS:${input.variableSymbol}`,
    `MSG:${message}`,
  ].join('*');
}

function createProforma(order: DurableOrder, issuedAt: string): DurableProforma {
  const variableSymbol = variableSymbolFromOrderId(order.orderId);
  const proformaId = `proforma-${order.orderId}`;
  return {
    proformaId,
    number: `PF-2026-${variableSymbol.slice(-8).padStart(8, '0')}`,
    orderId: order.orderId,
    issuedAt,
    dueDate: dueDateFromIssuedAt(issuedAt),
    amountCzk: order.priceCzk,
    variableSymbol,
    bankAccount: COMMERCIAL_PAYMENT_ACCOUNT,
    spdPayload: buildSpdQrPayload({
      iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
      amountCzk: order.priceCzk,
      variableSymbol,
      message: `CONIS ${order.package.name} · ${order.partner.partnerName}`,
    }),
  };
}

export class FileProformaRepository implements ProformaRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(
    readonly statePath = defaultStatePath(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  async issue(order: DurableOrder): Promise<ProformaIssuance> {
    return this.exclusively(async () => {
      const state = await this.read();
      const existing = state.proformas.find((item) => item.orderId === order.orderId);
      if (existing !== undefined) return { proforma: existing, created: false };
      const proforma = createProforma(order, this.now().toISOString());
      await this.write({ proformas: [...state.proformas, proforma] });
      return { proforma, created: true };
    });
  }

  async getByOrderId(orderId: string): Promise<DurableProforma | null> {
    return (await this.read()).proformas.find((item) => item.orderId === orderId) ?? null;
  }

  async getByProformaId(proformaId: string): Promise<DurableProforma | null> {
    return (await this.read()).proformas.find((item) => item.proformaId === proformaId) ?? null;
  }

  private async read(): Promise<ProformaState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as ProformaState;
      return { proformas: Array.isArray(parsed.proformas) ? parsed.proformas : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { proformas: [] };
      throw error;
    }
  }

  private async write(state: ProformaState): Promise<void> {
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
