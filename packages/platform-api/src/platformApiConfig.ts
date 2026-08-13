import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LOCAL_ALLOWED_ORIGINS = [
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4177',
  'http://127.0.0.1:4175',
  'http://127.0.0.1:4181',
  'http://127.0.0.1:4192',
];

const LOCAL_SAME_SITE_ALLOWED_ORIGINS = [
  'https://conis.cz:4175',
  'https://conis.cz:4177',
];

export function platformApiStatePath(fileName: string): string {
  const stateDirectory = process.env.PLATFORM_API_STATE_DIR;
  if (stateDirectory !== undefined && stateDirectory.trim().length > 0) {
    return join(stateDirectory, fileName);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PLATFORM_API_STATE_DIR is required in production.');
  }
  return join(tmpdir(), 'embed-engine-platform-api', fileName);
}

export function platformApiHost(): string {
  return process.env.PLATFORM_API_HOST ?? (
    process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
  );
}

export function platformApiPort(): number {
  const port = Number.parseInt(process.env.PLATFORM_API_PORT ?? '4310', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PLATFORM_API_PORT must be a valid TCP port.');
  }
  return port;
}

export function platformApiAllowedOrigins(): ReadonlySet<string> {
  const configured = process.env.PLATFORM_API_ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];
  return new Set([
    ...LOCAL_ALLOWED_ORIGINS,
    ...LOCAL_SAME_SITE_ALLOWED_ORIGINS,
    'https://conis.cz',
    ...configured,
  ]);
}
