/**
 * EPIC-BX-20 — Bridge shell feedback → Learning registry (no Platform Access change).
 */

import {
  findCompany,
  getDefaultCompanyRegistry,
  listPlatformFeedback,
  listProjectsForCompany,
  listWorkspacesForCompany,
  readLastPublish,
  type PlatformFeedbackPayload,
} from '@embed-engine/platform-access';

import {
  classifyLearningCategory,
  inferCapabilityFromMessage,
} from '../engine/classifyLearningFeedback';
import type { LearningFeedbackEntry } from '../domain/types';
import {
  listLearningFeedback,
  upsertLearningFeedback,
} from '../registry/learningFeedbackRegistry';

function feedbackId(payload: PlatformFeedbackPayload): string {
  return `shell-${payload.createdAt}-${payload.message.slice(0, 24)}`;
}

export function bridgePlatformFeedbackToLearning(): readonly LearningFeedbackEntry[] {
  const registry = getDefaultCompanyRegistry();
  const lastPublish = readLastPublish();
  const existing = new Set(listLearningFeedback().map((item) => item.id));

  for (const payload of listPlatformFeedback()) {
    const id = feedbackId(payload);
    if (existing.has(id)) continue;

    const companyId =
      payload.companyId ?? registry.companies[0]?.id ?? 'unknown-company';
    const company = findCompany(registry, companyId);
    const workspaces = listWorkspacesForCompany(registry, companyId);
    const projects = listProjectsForCompany(registry, companyId);
    const workspaceId = workspaces[0]?.id ?? 'unknown-workspace';
    const projectId = projects[0]?.id ?? null;

    const entry: LearningFeedbackEntry = {
      id,
      message: payload.message,
      category: classifyLearningCategory(payload.message),
      companyId: company?.id ?? companyId,
      workspaceId,
      projectId,
      studioId: payload.studioId,
      capabilityId: inferCapabilityFromMessage(
        payload.message,
        payload.studioId,
      ),
      releaseLabel: lastPublish?.label ?? null,
      createdAt: payload.createdAt,
      source: 'shell-feedback',
    };
    upsertLearningFeedback(entry);
  }

  return listLearningFeedback();
}
