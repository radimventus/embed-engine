import { platformApiOrigin, syncCanonicalRegistryFromAuthority, type PlatformCanonicalProject } from '@embed-engine/platform-access';

export type ProjectMetadataInput = Pick<PlatformCanonicalProject, 'name' | 'description' | 'status' | 'metadata'>;

export async function saveCanonicalProjectMetadata(projectId: string, input: ProjectMetadataInput): Promise<void> {
  const response = await fetch(`${platformApiOrigin().replace(/\/$/, '')}/public/auth/canonical-project-authority`, {
    method: 'PATCH', credentials: 'include', headers: {'content-type': 'application/json'},
    body: JSON.stringify({projectId, ...input}),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as {error?: string};
    throw new Error(body.error ?? `Projekt se nepodařilo uložit (HTTP ${response.status}).`);
  }
  const synced = await syncCanonicalRegistryFromAuthority();
  if (!synced.ok) throw new Error('Projekt byl uložen, ale seznam se nepodařilo obnovit. Obnovte stránku.');
}
