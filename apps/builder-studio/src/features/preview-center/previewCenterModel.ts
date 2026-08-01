/**
 * EPIC-BX-06 — Preview Center view-model (facade over HP + Experience + Runtime scenario).
 */

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { buildDecisionPath, type DecisionPathStep } from './decisionPath';
import { buildDecisionQaReport, type DecisionQaReport } from './decisionQa';
import {
  getPreviewDevice,
  type PreviewDevice,
  type PreviewDeviceId,
} from './previewDevices';
import {
  getPreviewPersona,
  type PreviewPersona,
  type PreviewPersonaId,
} from './previewPersonas';

export type PreviewCenterModel = {
  readonly persona: PreviewPersona;
  readonly device: PreviewDevice;
  readonly comparePersona: PreviewPersona;
  readonly compareDevice: PreviewDevice;
  readonly path: readonly DecisionPathStep[];
  readonly qa: DecisionQaReport;
  readonly remountKey: string;
};

export function buildPreviewCenterModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly personaId: PreviewPersonaId;
  readonly deviceId: PreviewDeviceId;
  readonly comparePersonaId: PreviewPersonaId;
  readonly compareDeviceId: PreviewDeviceId;
  readonly compareActive: boolean;
  readonly activeCompareSide: 'primary' | 'compare';
}): PreviewCenterModel {
  const persona = getPreviewPersona(input.personaId);
  const device = getPreviewDevice(input.deviceId);
  const comparePersona = getPreviewPersona(input.comparePersonaId);
  const compareDevice = getPreviewDevice(input.compareDeviceId);
  const activePersona =
    input.compareActive && input.activeCompareSide === 'compare'
      ? comparePersona
      : persona;
  const activeDevice =
    input.compareActive && input.activeCompareSide === 'compare'
      ? compareDevice
      : device;

  const path = buildDecisionPath({
    projectId: input.projectId,
    heroRelativePath: input.snapshot?.working.heroRelativePath,
  });
  const qa = buildDecisionQaReport({
    projectId: input.projectId,
    snapshot: input.snapshot,
    validationReport: input.validationReport,
  });

  const remountKey = [
    input.projectId,
    input.snapshot?.mountedAt ?? 'none',
    input.snapshot?.dirtyState ?? 'clean',
    input.snapshot?.working.heroRelativePath ?? '',
    activePersona.id,
    activePersona.priorityIds.join('|'),
    activeDevice.id,
    input.compareActive ? 'compare' : 'single',
    input.activeCompareSide,
  ].join(':');

  return {
    persona,
    device,
    comparePersona,
    compareDevice,
    path,
    qa,
    remountKey,
  };
}
