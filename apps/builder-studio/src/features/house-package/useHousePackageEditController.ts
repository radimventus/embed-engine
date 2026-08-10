import { useCallback, useEffect, useMemo, useState } from 'react';

import { buildPersistFiles } from './buildPersistFiles';
import {
  createHousePackageEditSession,
  type HousePackageEditSession,
  type HousePackageEditSnapshot,
} from './housePackageEditSession';
import type { HousePackageValidationReport } from './housePackageValidationReport';
import type { HousePackageReleaseSummary } from './productionPublishGate';
import { buildHousePackageValidationReport } from './housePackageValidationReport';
import {
  buildReleaseVerification,
  fingerprintHousePackageContent,
  PRODUCTION_RUNTIME_SOURCE,
  type ReleaseVerification,
} from './releaseVerification';
import { requestHousePackagePersist } from './requestHousePackagePersist';
import { requestHousePackagePublish } from './requestHousePackagePublish';
import { runDiskHousePackageValidation } from './runHousePackageValidation';
import { useHousePackageMount } from './useHousePackageMount';
import { validateHousePackageWorking } from './validateHousePackageWorking';
import { openHousePackageRuntimePreviewWindow } from './mountHousePackageRuntimePreview';
import type { HousePackageMountValidationMode } from './mountHousePackage';

export type HousePackageEditController = {
  readonly mountStatus: ReturnType<typeof useHousePackageMount>['state'];
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly saving: boolean;
  readonly validating: boolean;
  readonly publishing: boolean;
  readonly previewOpen: boolean;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly releaseVerification: ReleaseVerification | null;
  readonly publishError: string | null;
  readonly apply: (next: HousePackageEditSnapshot) => void;
  readonly save: (snapshot?: HousePackageEditSnapshot) => Promise<void>;
  readonly validate: () => Promise<void>;
  readonly publish: () => Promise<HousePackageReleaseSummary | null>;
  readonly openPreview: () => void;
  readonly closePreview: () => void;
};

/**
 * CAP-BLD-03..08 — mount, edit, persist, validate, publish, Runtime Preview.
 */
export function useHousePackageEditController(
  diskRoot: string | null,
  houseId: string | null = null,
  validationMode: HousePackageMountValidationMode = 'PUBLISH_READY',
): HousePackageEditController {
  const { state: mountStatus, remount } = useHousePackageMount(
    diskRoot,
    houseId,
    validationMode,
  );
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationReport, setValidationReport] =
    useState<HousePackageValidationReport | null>(null);
  const [releaseSummary, setReleaseSummary] =
    useState<HousePackageReleaseSummary | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    setReleaseSummary(null);
    setPublishError(null);
    setValidationReport(null);
    setSessionEpoch((value) => value + 1);
  }, [diskRoot, houseId, validationMode]);

  const session = useMemo(() => {
    if (mountStatus.status !== 'ready') {
      return null;
    }
    return createHousePackageEditSession(mountStatus.mount);
  }, [mountStatus, sessionEpoch]);

  const [snapshot, setSnapshot] = useState<HousePackageEditSnapshot | null>(
    null,
  );

  useEffect(() => {
    if (session === null) {
      setSnapshot(null);
      return;
    }
    setSnapshot(session.snapshot());
  }, [session]);

  const apply = useCallback((next: HousePackageEditSnapshot) => {
    setSnapshot(next);
  }, []);

  const housePackageFingerprint = useMemo(() => {
    if (snapshot === null) {
      return null;
    }
    let manifestVersion = '1';
    try {
      const parsed = JSON.parse(snapshot.working.manifestJson ?? '{}') as {
        version?: unknown;
      };
      if (
        typeof parsed.version === 'string' ||
        typeof parsed.version === 'number'
      ) {
        manifestVersion = String(parsed.version);
      }
    } catch {
      // keep default
    }
    return fingerprintHousePackageContent({
      roomsCsv: snapshot.working.roomsCsv,
      galleryCsv: snapshot.working.galleryCsv,
      videosCsv: snapshot.working.videosCsv,
      heroRelativePath: snapshot.working.heroRelativePath,
      manifestVersion,
    });
  }, [snapshot]);

  const releaseVerification = useMemo((): ReleaseVerification | null => {
    if (releaseSummary === null || housePackageFingerprint === null) {
      return null;
    }
    return buildReleaseVerification({
      publishFingerprint: releaseSummary.buildFingerprint,
      runtimeFingerprint: PRODUCTION_RUNTIME_SOURCE,
      housePackageFingerprint,
      buildTimestamp: releaseSummary.releaseTimestamp,
      housePackageVersion: releaseSummary.housePackageVersion,
      embedVersion: releaseSummary.embedVersion,
      previewOpen: false,
    });
  }, [housePackageFingerprint, releaseSummary]);

  const validate = useCallback(async () => {
    const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';
    setValidating(true);
    try {
      const report = await runDiskHousePackageValidation({ dirty });
      setValidationReport(report);
    } finally {
      setValidating(false);
    }
  }, [snapshot]);

  const save = useCallback(async (sourceSnapshot = snapshot) => {
    if (session === null || sourceSnapshot === null) {
      return;
    }
    if (sourceSnapshot.dirtyState === 'clean') {
      return;
    }

    const validation = validateHousePackageWorking(sourceSnapshot.working);
    if (!validation.ok) {
      apply(
        session.markSaveFailed(
          'Cannot save: House Package validation failed. Fix errors first.',
        ),
      );
      return;
    }

    const { files } = buildPersistFiles(
      sourceSnapshot.baseline,
      sourceSnapshot.working,
    );
    if (
      files.roomsCsv === undefined &&
      files.galleryCsv === undefined &&
      files.videosCsv === undefined &&
      files.manifestJson === undefined
    ) {
      apply(session.clearSaveFailed());
      return;
    }

    setSaving(true);
    try {
      if (diskRoot === null) {
        apply(
          session.markSaveFailed(
            'Cannot save: active House Package root is unavailable.',
          ),
        );
        return;
      }
      const result = await requestHousePackagePersist(files, diskRoot);
      if (!result.ok) {
        apply(session.markSaveFailed(result.error));
        return;
      }
      await remount();
      setSessionEpoch((value) => value + 1);
    } catch (error: unknown) {
      apply(
        session.markSaveFailed(
          error instanceof Error ? error.message : 'Persist request failed.',
        ),
      );
    } finally {
      setSaving(false);
    }
  }, [apply, diskRoot, remount, session, snapshot]);

  const publish = useCallback(async (): Promise<HousePackageReleaseSummary | null> => {
    const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';
    setPublishing(true);
    setPublishError(null);
    setReleaseSummary(null);
    try {
      const gateReport = await runDiskHousePackageValidation({ dirty });
      setValidationReport(gateReport);
      if (!gateReport.canPublish) {
        setPublishError(
          'Publish blocked: object-house validation has ERROR. Fix issues and retry.',
        );
        return null;
      }

      const result = await requestHousePackagePublish();
      if (!result.ok) {
        setPublishError(`[${result.stage}] ${result.error}`);
        if (result.validationErrors !== undefined) {
          setValidationReport(
            buildHousePackageValidationReport({
              errors: result.validationErrors,
              warnings:
                dirty === true
                  ? [
                      {
                        type: 'UNSAVED_WORKING_COPY',
                        file: '(session)',
                        item: 'working-copy',
                        description:
                          'Unsaved Builder edits will not be included until Save.',
                        category: 'mandatory',
                        editor: 'overview',
                      },
                    ]
                  : undefined,
              source: 'disk',
            }),
          );
        }
        return null;
      }

      setReleaseSummary(result.summary);
      await remount();
      setSessionEpoch((value) => value + 1);
      return result.summary;
    } catch (error: unknown) {
      setPublishError(
        error instanceof Error ? error.message : 'Publish request failed.',
      );
      return null;
    } finally {
      setPublishing(false);
    }
  }, [remount, snapshot]);

  const openPreview = useCallback(() => {
    openHousePackageRuntimePreviewWindow();
  }, []);

  return {
    mountStatus,
    snapshot,
    session,
    saving,
    validating,
    publishing,
    previewOpen: false,
    validationReport,
    releaseSummary,
    releaseVerification,
    publishError,
    apply,
    save,
    validate,
    publish,
    openPreview,
    closePreview: () => {
      // Preview runs in a separate window (PR-024).
    },
  };
}
