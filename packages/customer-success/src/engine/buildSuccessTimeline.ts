/**
 * EPIC-BX-17 — Success Timeline from existing activity / publish / session.
 */

import type {
  CustomerSuccessSnapshotInput,
  SuccessTimelineEvent,
} from '../domain/types';

function findActivityAt(
  labels: readonly string[],
  needle: string,
): boolean {
  return labels.some((label) =>
    label.toLowerCase().includes(needle.toLowerCase()),
  );
}

export function buildSuccessTimeline(
  input: CustomerSuccessSnapshotInput,
): readonly SuccessTimelineEvent[] {
  const firstLogin =
    input.lastLoginAt !== null || input.sessionActive;
  const firstPublish = input.lastPublishAt !== null;
  const firstPreview = findActivityAt(input.activityLabels, 'preview');
  const firstRelease =
    firstPublish ||
    findActivityAt(input.activityLabels, 'publish') ||
    findActivityAt(input.activityLabels, 'release');
  const firstLead =
    findActivityAt(input.activityLabels, 'lead') ||
    findActivityAt(input.activityLabels, 'pipeline');

  return [
    {
      id: 'first-login',
      label: 'První login',
      at: input.lastLoginAt,
      detail: firstLogin ? 'Session / login zaznamenán' : 'Zatím bez loginu',
      occurred: firstLogin,
    },
    {
      id: 'first-publish',
      label: 'První publish',
      at: input.lastPublishAt,
      detail:
        input.lastPublishLabel ??
        (firstPublish ? 'Publish marker' : 'Zatím bez publish'),
      occurred: firstPublish,
    },
    {
      id: 'first-preview',
      label: 'První preview',
      at: firstPreview ? input.lastLoginAt : null,
      detail: firstPreview
        ? 'Preview aktivita zaznamenána'
        : 'Zatím bez preview',
      occurred: firstPreview,
    },
    {
      id: 'first-release',
      label: 'První release',
      at: firstRelease ? input.lastPublishAt : null,
      detail: firstRelease
        ? 'Release / publish signal'
        : 'Zatím bez release',
      occurred: firstRelease,
    },
    {
      id: 'first-lead',
      label: 'První lead',
      at: firstLead ? input.lastLoginAt : null,
      detail: firstLead ? 'Lead / pipeline signal' : 'Zatím bez leadu',
      occurred: firstLead,
    },
  ];
}
