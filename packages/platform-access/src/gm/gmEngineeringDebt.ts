/**
 * EPIC-BX-16 — Known architectural debt (not bugs).
 */

import type { GmEngineeringDebtItem } from './gmTypes';

export const GM_ENGINEERING_DEBT: readonly GmEngineeringDebtItem[] = [
  {
    id: 'soft-rbac',
    title: 'Soft RBAC enforcement',
    detail:
      'Role model is prepared in Platform Access; studio guards remain client-side for pilot.',
    area: 'Authentication',
  },
  {
    id: 'local-session-store',
    title: 'Cookie / localStorage session',
    detail:
      'Shared cross-studio session uses browser storage — not production IAM.',
    area: 'Authentication',
  },
  {
    id: 'in-memory-provisions',
    title: 'In-memory pilot provisions',
    detail:
      'Provisioned pilot firms live in process extras until a durable tenant store exists.',
    area: 'Pilot',
  },
  {
    id: 'runtime-proxy-health',
    title: 'Runtime health via project presence',
    detail:
      'Operational Runtime status aggregates project bootstrap signals; no live Runtime probe.',
    area: 'Runtime',
  },
  {
    id: 'intelligence-adapter-flag',
    title: 'Intelligence readiness is adapter-level',
    detail:
      'Intelligence Core is unchanged; readiness reflects project bootstrap adapter readiness.',
    area: 'Intelligence',
  },
  {
    id: 'publish-local-marker',
    title: 'Publish health from last-publish marker',
    detail:
      'Publish pipeline is unchanged; GM reads the last recorded publish label only.',
    area: 'Publish',
  },
  {
    id: 'dual-deploy-mode',
    title: 'Local ports vs cloud path dual-mode',
    detail:
      'Studio hrefs switch between Vite ports and app.conis.cz paths without a deploy control plane.',
    area: 'Platform',
  },
] as const;
