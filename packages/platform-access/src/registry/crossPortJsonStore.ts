/**
 * PT-PROJECT-01 — Cross-port JSON persistence for Shared Project Runtime.
 *
 * Platform session already uses cookies so Studio Vite ports share identity.
 * localStorage is origin-isolated per port (4181 ≠ 4182) — Runtime must not
 * rely on it alone or Builder-authored projects never reach Office/Manager.
 */

const COOKIE_CHUNK_SIZE = 3_000;
const CHUNK_COUNT_SUFFIX = '__chunks';

function readCookies(): ReadonlyMap<string, string> {
  if (typeof document === 'undefined') return new Map();
  return new Map(
    document.cookie
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => {
        const separator = part.indexOf('=');
        return separator < 0
          ? [part, '']
          : [part.slice(0, separator), part.slice(separator + 1)];
      }),
  );
}

function readChunkedCookie(cookieName: string): string | null {
  const cookies = readCookies();
  const count = Number(cookies.get(`${cookieName}${CHUNK_COUNT_SUFFIX}`));
  if (!Number.isInteger(count) || count < 1) return null;

  let encoded = '';
  for (let index = 0; index < count; index += 1) {
    const chunk = cookies.get(`${cookieName}__${index}`);
    if (chunk === undefined) return null;
    encoded += chunk;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

function readLegacyCookie(cookieName: string): string | null {
  const raw = readCookies().get(cookieName);
  if (raw === undefined || raw.length === 0) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function readCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
}): string | null {
  if (typeof document !== 'undefined') {
    const chunked = readChunkedCookie(input.cookieName);
    if (chunked !== null) return chunked;
    const legacy = readLegacyCookie(input.cookieName);
    if (legacy !== null) return legacy;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(input.storageKey);
    } catch {
      return null;
    }
  }
  return null;
}

export function writeCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
  readonly json: string;
  readonly maxAgeSeconds?: number;
}): void {
  const maxAge = input.maxAgeSeconds ?? 60 * 60 * 24 * 30;
  if (typeof document !== 'undefined') {
    const encoded = encodeURIComponent(input.json);
    const previousChunkCount = Number(
      readCookies().get(`${input.cookieName}${CHUNK_COUNT_SUFFIX}`),
    );
    const chunks = Array.from(
      { length: Math.ceil(encoded.length / COOKIE_CHUNK_SIZE) },
      (_, index) =>
        encoded.slice(
          index * COOKIE_CHUNK_SIZE,
          (index + 1) * COOKIE_CHUNK_SIZE,
        ),
    );
    document.cookie = `${input.cookieName}${CHUNK_COUNT_SUFFIX}=${chunks.length}; path=/; max-age=${maxAge}; SameSite=Lax`;
    for (const [index, chunk] of chunks.entries()) {
      document.cookie = `${input.cookieName}__${index}=${chunk}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
    const oldCount = Number.isInteger(previousChunkCount)
      ? previousChunkCount
      : 0;
    for (let index = chunks.length; index < oldCount; index += 1) {
      document.cookie = `${input.cookieName}__${index}=; path=/; max-age=0`;
    }
    document.cookie = `${input.cookieName}=; path=/; max-age=0`;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(input.storageKey, input.json);
    } catch {
      // quota / private mode — cookie may still carry the payload
    }
  }
}

export function clearCrossPortJson(input: {
  readonly cookieName: string;
  readonly storageKey: string;
}): void {
  if (typeof document !== 'undefined') {
    const chunkCount = Number(
      readCookies().get(`${input.cookieName}${CHUNK_COUNT_SUFFIX}`),
    );
    document.cookie = `${input.cookieName}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${input.cookieName}${CHUNK_COUNT_SUFFIX}=; path=/; max-age=0; SameSite=Lax`;
    if (Number.isInteger(chunkCount) && chunkCount > 0) {
      for (let index = 0; index < chunkCount; index += 1) {
        document.cookie = `${input.cookieName}__${index}=; path=/; max-age=0; SameSite=Lax`;
      }
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(input.storageKey);
    } catch {
      // ignore
    }
  }
}
