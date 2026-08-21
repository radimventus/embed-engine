#!/usr/bin/env node
/**
 * One-time operational recovery: restore canonical CONIS Admin scope on an
 * existing account without resetting unrelated Platform API state.
 *
 * Usage (on Railway with /data mounted):
 *   PLATFORM_API_STATE_DIR=/data node scripts/ops/restore-conis-admin-scope.mjs <email>
 *
 * Does not print or mutate password hashes, session tokens, or invite tokens.
 */
import { readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CANONICAL_ADMIN_SCOPE = {
  roles: ['conis-admin'],
  tenantId: 'tenant-conis-admin',
  companyId: 'company-conis',
  workspaceId: 'workspace-conis',
  projectId: 'project-conis',
};

function statePath(fileName) {
  const root = process.env.PLATFORM_API_STATE_DIR?.trim() || join(process.cwd(), '.platform-api-state');
  return join(root, fileName);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function writeAtomic(path, payload) {
  const tempPath = `${path}.tmp-${process.pid}`;
  await writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
  await rename(tempPath, path);
}

async function main() {
  const email = normalizeEmail(process.argv[2] ?? '');
  if (email.length === 0) {
    console.error('Usage: restore-conis-admin-scope.mjs <email>');
    process.exit(1);
  }

  const path = statePath('partner-sessions.json');
  const state = JSON.parse(await readFile(path, 'utf8'));
  const accountIndex = state.accounts.findIndex((item) => item.email === email);
  if (accountIndex < 0) {
    console.error(`No account found for ${email}`);
    process.exit(1);
  }

  const before = state.accounts[accountIndex];
  const after = {
    ...before,
    ...CANONICAL_ADMIN_SCOPE,
  };
  state.accounts[accountIndex] = after;

  const accountId = before.id;
  state.sessions = state.sessions.map((session) =>
    session.accountId === accountId
      ? {
          ...session,
          tenantId: CANONICAL_ADMIN_SCOPE.tenantId,
          companyId: CANONICAL_ADMIN_SCOPE.companyId,
          workspaceId: CANONICAL_ADMIN_SCOPE.workspaceId,
          projectId: CANONICAL_ADMIN_SCOPE.projectId,
          workspaceContext: null,
        }
      : session,
  );

  await writeAtomic(path, state);

  console.log(
    JSON.stringify(
      {
        ok: true,
        email,
        before: {
          id: before.id,
          roles: before.roles,
          tenantId: before.tenantId,
          companyId: before.companyId,
          workspaceId: before.workspaceId,
          projectId: before.projectId,
        },
        after: {
          id: after.id,
          roles: after.roles,
          tenantId: after.tenantId,
          companyId: after.companyId,
          workspaceId: after.workspaceId,
          projectId: after.projectId,
        },
        sessionsUpdated: state.sessions.filter((session) => session.accountId === accountId).length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
