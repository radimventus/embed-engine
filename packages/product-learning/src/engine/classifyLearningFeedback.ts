/**
 * EPIC-BX-20 — Deterministic learning category classification (no AI).
 */

import type { CapabilityId } from '@embed-engine/capabilities';
import type { PlatformStudioId } from '@embed-engine/platform-access';

import type { LearningCategory } from '../domain/types';

const RULES: readonly {
  readonly category: LearningCategory;
  readonly needles: readonly string[];
}[] = [
  {
    category: 'Bug',
    needles: ['bug', 'error', 'crash', 'broken', 'nefunguje', 'chyba', 'fail'],
  },
  {
    category: 'Performance',
    needles: ['slow', 'latency', 'performance', 'pomal', 'lag', 'timeout'],
  },
  {
    category: 'UX',
    needles: ['ux', 'ui', 'button', 'layout', 'confus', 'navig', 'design', 'klik'],
  },
  {
    category: 'Feature Request',
    needles: ['feature', 'add', 'wish', 'chtěl', 'chtel', 'missing', 'nová', 'nova'],
  },
  {
    category: 'Platform',
    needles: ['platform', 'shell', 'session', 'login', 'auth', 'tenant', 'workspace'],
  },
  {
    category: 'Product',
    needles: ['product', 'roadmap', 'capability', 'studio', 'publish', 'experience'],
  },
];

export function classifyLearningCategory(message: string): LearningCategory {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.needles.some((needle) => lower.includes(needle))) {
      return rule.category;
    }
  }
  return 'Product';
}

export function inferCapabilityFromMessage(
  message: string,
  studioId: PlatformStudioId | null,
): CapabilityId | null {
  const lower = message.toLowerCase();
  if (lower.includes('publish') || lower.includes('release')) return 'release';
  if (lower.includes('preview')) return 'preview';
  if (lower.includes('media')) return 'media';
  if (lower.includes('knowledge') || lower.includes('faq')) return 'knowledge';
  if (lower.includes('experience')) return 'experience';
  if (lower.includes('intelligence') || lower.includes('ai')) return 'intelligence';
  if (lower.includes('success') || lower.includes('onboarding')) {
    return 'customer-success';
  }
  if (lower.includes('ops') || lower.includes('operations')) {
    return 'operations-center';
  }
  if (studioId === 'builder') return 'dashboard';
  if (studioId === 'manager') return 'operations';
  if (studioId === 'sales') return 'pipeline';
  return null;
}
