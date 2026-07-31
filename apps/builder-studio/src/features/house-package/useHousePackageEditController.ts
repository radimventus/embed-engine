import { useCallback, useEffect, useMemo, useState } from 'react';

import { buildPersistFiles } from './buildPersistFiles';
import {
  createHousePackageEditSession,
  type HousePackageEditSession,
  type HousePackageEditSnapshot,
} from './housePackageEditSession';
import type { HousePackageValidationReport } from './housePackageValidationReport';
import { requestHousePackagePersist } from './requestHousePackagePersist';
import { runDiskHousePackageValidation } from './runHousePackageValidation';
import { useHousePackageMount } from './useHousePackageMount';
import { validateHousePackageWorking } from './validateHousePackageWorking';

export type HousePackageEditController = {
  readonly mountStatus: ReturnType<typeof useHousePackageMount>['state'];
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly saving: boolean;
  readonly validating: boolean;
  readonly validationReport: HousePackageValidationReport | null;
  readonly apply: (next: HousePackageEditSnapshot) => void;
  readonly save: () => Promise<void>;
  readonly validate: () => Promise<void>;
};

/**
 * CAP-BLD-03/04/05 — mount, edit, persist, disk validation (publish gate).
 */
export function useHousePackageEditController(): HousePackageEditController {
  const { state: mountStatus, remount } = useHousePackageMount();
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] =
    useState<HousePackageValidationReport | null>(null);

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

  useEffect(() => {
    if (mountStatus.status !== 'ready') {
      return;
    }
    let cancelled = false;
    void (async () => {
      setValidating(true);
      try {
        const dirty = snapshot !== null && snapshot.dirtyState !== 'clean';
        const report = await runDiskHousePackageValidation({ dirty });
        if (!cancelled) {
          setValidationReport(report);
        }
      } finally {
        if (!cancelled) {
          setValidating(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-validate after mount/remount (sessionEpoch), not on every keystroke.
  }, [mountStatus.status, sessionEpoch]);

  const save = useCallback(async () => {
    if (session === null || snapshot === null) {
      return;
    }
    if (snapshot.dirtyState === 'clean') {
      return;
    }

    const validation = validateHousePackageWorking(snapshot.working);
    if (!validation.ok) {
      apply(
        session.markSaveFailed(
          'Cannot save: House Package validation failed. Fix errors first.',
        ),
      );
      return;
    }

    const { files } = buildPersistFiles(snapshot.baseline, snapshot.working);
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
      const result = await requestHousePackagePersist(files);
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
  }, [apply, remount, session, snapshot]);

  return {
    mountStatus,
    snapshot,
    session,
    saving,
    validating,
    validationReport,
    apply,
    save,
    validate,
  };
}
