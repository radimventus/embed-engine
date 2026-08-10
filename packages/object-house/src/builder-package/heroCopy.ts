import type { ExperienceHeroCopy } from '@embed-engine/model';

export const DEFAULT_HERO_COPY: ExperienceHeroCopy = Object.freeze({
  eyebrow: 'MODERN A01 – 4+kk',
  headline: 'Rodinný dům, kde to dýchá štěstím',
  metrics: Object.freeze([
    Object.freeze({ value: '124 m2', label: 'Užitná plocha' }),
    Object.freeze({ value: 'A ++', label: 'Energetická třída' }),
    Object.freeze({ value: 'Dřevostavba', label: 'Difuzně otevřená' }),
  ]),
});

function isMetric(value: unknown): value is ExperienceHeroCopy['metrics'][number] {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const metric = value as Record<string, unknown>;
  return typeof metric.label === 'string' && typeof metric.value === 'string';
}

export function isHeroCopy(value: unknown): value is ExperienceHeroCopy {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const copy = value as Record<string, unknown>;
  return (
    typeof copy.eyebrow === 'string' &&
    typeof copy.headline === 'string' &&
    Array.isArray(copy.metrics) &&
    copy.metrics.length === 3 &&
    copy.metrics.every(isMetric)
  );
}

/** Reads optional House-level Hero copy from the existing package manifest. */
export function readHeroCopyFromManifest(
  manifestJson: string | null,
): ExperienceHeroCopy | null {
  if (manifestJson === null || manifestJson.trim().length === 0) {
    return null;
  }
  try {
    const manifest = JSON.parse(manifestJson) as Record<string, unknown>;
    return isHeroCopy(manifest.heroCopy) ? manifest.heroCopy : null;
  } catch {
    return null;
  }
}

/** Reads the optional persisted Hero media path from a House Package manifest. */
export function readHeroRelativePathFromManifest(
  manifestJson: string | null,
): string | null {
  if (manifestJson === null || manifestJson.trim().length === 0) {
    return null;
  }
  try {
    const manifest = JSON.parse(manifestJson) as Record<string, unknown>;
    const path = manifest.heroRelativePath;
    return typeof path === 'string' && path.trim().length > 0
      ? path.trim()
      : null;
  } catch {
    return null;
  }
}
