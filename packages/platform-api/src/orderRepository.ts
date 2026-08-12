import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type DurableOrderInput = {
  readonly orderId: string;
  readonly createdAt: string;
  readonly partner: {
    readonly partnerName: string;
    readonly companyName: string;
    readonly contactName: string;
    readonly email: string;
    readonly phone: string;
    readonly ico: string | null;
  };
  readonly package: {
    readonly id: string;
    readonly name: string;
    readonly licenseLabel: string;
    readonly trialDays: number;
  };
  readonly priceCzk: number;
  readonly termsVersion: string;
  readonly termsAcceptedAt: string;
};

export type DurableOrder = DurableOrderInput;

export interface OrderRepository {
  create(input: DurableOrderInput): Promise<DurableOrder>;
  getByOrderId(orderId: string): Promise<DurableOrder | null>;
}

type OrderState = {
  readonly orders: readonly DurableOrder[];
};

function defaultStatePath(): string {
  return join(tmpdir(), 'embed-engine-platform-api', 'orders.json');
}

function isIsoTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function validateOrder(input: DurableOrderInput): DurableOrder {
  const required = [
    input.orderId,
    input.partner.partnerName,
    input.partner.companyName,
    input.partner.contactName,
    input.partner.email,
    input.partner.phone,
    input.package.id,
    input.package.name,
    input.package.licenseLabel,
    input.termsVersion,
  ];
  if (
    required.some((value) => value.trim().length === 0) ||
    !isIsoTimestamp(input.createdAt) ||
    !isIsoTimestamp(input.termsAcceptedAt) ||
    !Number.isFinite(input.priceCzk) ||
    input.priceCzk < 0 ||
    !Number.isInteger(input.package.trialDays) ||
    input.package.trialDays < 0
  ) {
    throw new Error('Invalid durable order.');
  }
  return {
    ...input,
    orderId: input.orderId.trim(),
    createdAt: new Date(input.createdAt).toISOString(),
    partner: {
      ...input.partner,
      partnerName: input.partner.partnerName.trim(),
      companyName: input.partner.companyName.trim(),
      contactName: input.partner.contactName.trim(),
      email: input.partner.email.trim().toLowerCase(),
      phone: input.partner.phone.trim(),
      ico: input.partner.ico?.trim() || null,
    },
    package: {
      ...input.package,
      id: input.package.id.trim(),
      name: input.package.name.trim(),
      licenseLabel: input.package.licenseLabel.trim(),
    },
    termsVersion: input.termsVersion.trim(),
    termsAcceptedAt: new Date(input.termsAcceptedAt).toISOString(),
  };
}

export class FileOrderRepository implements OrderRepository {
  private mutation: Promise<void> = Promise.resolve();

  constructor(readonly statePath = defaultStatePath()) {}

  async create(input: DurableOrderInput): Promise<DurableOrder> {
    const order = validateOrder(input);
    return this.exclusively(async () => {
      const state = await this.read();
      if (state.orders.some((item) => item.orderId === order.orderId)) {
        throw new Error('Order already exists.');
      }
      await this.write({ orders: [...state.orders, order] });
      return order;
    });
  }

  async getByOrderId(orderId: string): Promise<DurableOrder | null> {
    return (await this.read()).orders.find((item) => item.orderId === orderId) ?? null;
  }

  private async read(): Promise<OrderState> {
    try {
      const parsed = JSON.parse(await readFile(this.statePath, 'utf8')) as OrderState;
      return { orders: Array.isArray(parsed.orders) ? parsed.orders : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { orders: [] };
      throw error;
    }
  }

  private async write(state: OrderState): Promise<void> {
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
