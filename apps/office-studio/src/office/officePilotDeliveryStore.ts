/**
 * PE-07 / PT-CJ-00 — Pilot Delivery persistence (Office MVP).
 */

import type { PilotDeliveryRecord } from './officePilotDeliveryModel';

const STORAGE_KEY = 'conis.office.pilot-delivery.v1';

type DeliveryStore = {
  readonly byPartnerId: Record<string, PilotDeliveryRecord>;
};

let memoryStore: DeliveryStore = { byPartnerId: {} };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): DeliveryStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as {
      byPartnerId?: Record<string, PilotDeliveryRecord>;
    };
    memoryStore = {
      byPartnerId:
        parsed.byPartnerId !== null && typeof parsed.byPartnerId === 'object'
          ? parsed.byPartnerId
          : {},
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: DeliveryStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetPilotDeliveryStoreForTests(): void {
  memoryStore = { byPartnerId: {} };
  if (canUseStorage()) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getPilotDelivery(
  partnerId: string,
): PilotDeliveryRecord | null {
  return loadStore().byPartnerId[partnerId] ?? null;
}

export function listPilotDeliveries(): readonly PilotDeliveryRecord[] {
  return Object.values(loadStore().byPartnerId);
}

export function savePilotDeliveryRecord(
  delivery: PilotDeliveryRecord,
): void {
  const store = loadStore();
  saveStore({
    byPartnerId: {
      ...store.byPartnerId,
      [delivery.partnerId]: delivery,
    },
  });
}
