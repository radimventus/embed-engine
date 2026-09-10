import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  createPartnerPasswordReset,
  partnerPasswordResetStatus,
  passwordResetTokenMatches,
  revokePartnerPasswordReset,
  revokePendingPasswordResets,
  usePartnerPasswordReset,
  type PartnerPasswordResetRecord,
  type PartnerPasswordResetStatus,
} from './partnerPasswordResetLifecycle';

type PartnerPasswordResetState = {
  readonly resets: readonly PartnerPasswordResetRecord[];
};

export type IssuedPasswordReset = {
  readonly token: string;
  readonly expiresAt: string;
};

export type ResolvedPasswordReset = {
  readonly accountId: string;
  readonly expiresAt: string;
  readonly status: PartnerPasswordResetStatus;
};

export type PasswordResetCompletion =
  | {
      readonly ok: true;
      readonly accountId: string;
    }
  | {
      readonly ok: false;
      readonly reason: 'invalid-or-expired';
    };

/**
 * Durable reset-token repository.
 *
 * Only SHA-256 token verifiers are persisted. Mutations are serialized so one
 * token cannot complete two simultaneous password changes.
 */
export class FilePartnerPasswordResetRepository {
  private mutationTail: Promise<void> = Promise.resolve();
  private readonly statePath: string;

  constructor(statePath: string) {
    this.statePath = statePath;
  }

  async issue(
    accountId: string,
    nowMs = Date.now(),
  ): Promise<IssuedPasswordReset> {
    return this.exclusive(async () => {
      const state = await this.read();
      const issued = createPartnerPasswordReset(accountId, nowMs);
      const previous = revokePendingPasswordResets(
        state.resets,
        issued.record.accountId,
        nowMs,
      );

      await this.write({
        resets: [...previous, issued.record],
      });

      return {
        token: issued.token,
        expiresAt: issued.record.expiresAt,
      };
    });
  }

  async resolve(
    token: string,
    nowMs = Date.now(),
  ): Promise<ResolvedPasswordReset | null> {
    const trimmed = token.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const state = await this.read();
    const record = state.resets.find((candidate) =>
      passwordResetTokenMatches(candidate, trimmed),
    );

    if (record === undefined) {
      return null;
    }

    return {
      accountId: record.accountId,
      expiresAt: record.expiresAt,
      status: partnerPasswordResetStatus(record, nowMs),
    };
  }

  async revoke(
    token: string,
    nowMs = Date.now(),
  ): Promise<boolean> {
    return this.exclusive(async () => {
      const state = await this.read();
      const index = state.resets.findIndex((candidate) =>
        passwordResetTokenMatches(candidate, token.trim()),
      );

      if (index < 0) {
        return false;
      }

      const current = state.resets[index]!;
      const revoked = revokePartnerPasswordReset(current, nowMs);

      if (revoked === current) {
        return false;
      }

      const resets = [...state.resets];
      resets[index] = revoked;
      await this.write({ resets });
      return true;
    });
  }

  async complete(
    token: string,
    completeAccount: (accountId: string) => Promise<void>,
    nowMs = Date.now(),
  ): Promise<PasswordResetCompletion> {
    return this.exclusive(async () => {
      const trimmed = token.trim();

      if (trimmed.length === 0) {
        return {
          ok: false,
          reason: 'invalid-or-expired',
        };
      }

      const state = await this.read();
      const index = state.resets.findIndex((candidate) =>
        passwordResetTokenMatches(candidate, trimmed),
      );

      if (index < 0) {
        return {
          ok: false,
          reason: 'invalid-or-expired',
        };
      }

      const current = state.resets[index]!;

      if (partnerPasswordResetStatus(current, nowMs) !== 'pending') {
        return {
          ok: false,
          reason: 'invalid-or-expired',
        };
      }

      /*
       * The token becomes used only after the authoritative account operation
       * succeeds. A failed password write therefore remains safely retryable.
       */
      await completeAccount(current.accountId);

      const used = usePartnerPasswordReset(current, nowMs);

      if (used === null) {
        return {
          ok: false,
          reason: 'invalid-or-expired',
        };
      }

      const resets = state.resets.map((record, recordIndex) => {
        if (recordIndex === index) {
          return used;
        }

        return record.accountId === current.accountId
          ? revokePartnerPasswordReset(record, nowMs)
          : record;
      });

      await this.write({ resets });

      return {
        ok: true,
        accountId: current.accountId,
      };
    });
  }

  private async exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.mutationTail;
    let release!: () => void;

    this.mutationTail = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async read(): Promise<PartnerPasswordResetState> {
    try {
      const parsed = JSON.parse(
        await readFile(this.statePath, 'utf8'),
      ) as Partial<PartnerPasswordResetState>;

      return {
        resets: Array.isArray(parsed.resets) ? parsed.resets : [],
      };
    } catch (error) {
      if (
        error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return { resets: [] };
      }

      throw error;
    }
  }

  private async write(state: PartnerPasswordResetState): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true });

    const temporaryPath =
      `${this.statePath}.${process.pid}.${Date.now()}.tmp`;

    await writeFile(
      temporaryPath,
      `${JSON.stringify(state, null, 2)}\n`,
      {
        encoding: 'utf8',
        mode: 0o600,
      },
    );

    await rename(temporaryPath, this.statePath);
  }
}
