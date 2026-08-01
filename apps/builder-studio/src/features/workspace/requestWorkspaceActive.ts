/**
 * CAP-BLD-08 — activate HP root on Builder Vite host (metadata → mount root).
 */

export const WORKSPACE_ACTIVE_API = '/api/workspace/active';

export type WorkspaceActiveResponse =
  | {
      readonly ok: true;
      readonly packageRoot: string;
      readonly projectId: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

function parseActivePayload(payload: unknown): WorkspaceActiveResponse | null {
  if (payload === null || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }
  const record = payload as {
    ok: unknown;
    packageRoot?: unknown;
    projectId?: unknown;
    error?: unknown;
  };
  if (
    record.ok === true &&
    typeof record.packageRoot === 'string' &&
    typeof record.projectId === 'string'
  ) {
    return {
      ok: true,
      packageRoot: record.packageRoot,
      projectId: record.projectId,
    };
  }
  if (record.ok === false) {
    return {
      ok: false,
      error:
        typeof record.error === 'string'
          ? record.error
          : 'Workspace active request failed.',
    };
  }
  return null;
}

export async function requestWorkspaceActive(input: {
  readonly projectId: string;
  readonly packageRoot: string;
}): Promise<WorkspaceActiveResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 8_000);

  try {
    const response = await fetch(WORKSPACE_ACTIVE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const parsed = parseActivePayload(payload);
    if (parsed !== null) {
      return parsed;
    }

    return {
      ok: false,
      error: `Aktivace projektu selhala (HTTP ${response.status})`,
    };
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        ok: false,
        error: 'Aktivace projektu vypršela — zkuste znovu.',
      };
    }
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Aktivace projektu selhala.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestWorkspaceActiveStatus(): Promise<WorkspaceActiveResponse> {
  const response = await fetch(WORKSPACE_ACTIVE_API, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const parsed = parseActivePayload(payload);
  if (parsed !== null) {
    return parsed;
  }
  return {
    ok: false,
    error: 'No active workspace package root.',
  };
}
