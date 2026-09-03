import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const api = readFileSync(
  new URL('./index.ts', import.meta.url),
  'utf8',
);

const officeRequest = readFileSync(
  new URL(
    '../../../apps/office-studio/src/office/requestOfficePartner.ts',
    import.meta.url,
  ),
  'utf8',
);

test('commercial customer authority exposes only the current session company', () => {
  assert.match(
    api,
    /request\.method === "GET" && path === "\/partner\/company-profile"/,
  );
  assert.match(api, /const companyId = sessionCompanyId\(session\)/);
  assert.match(api, /officePartners\.getByCompanyId\(companyId\)/);
  assert.doesNotMatch(
    api.match(
      /path === "\/partner\/company-profile"[\s\S]*?return respond\(response, 200, \{ partner \}\);/,
    )?.[0] ?? '',
    /officePartners\.list\(\)/,
  );
});

test('global Office Partner authoring gate remains intact', () => {
  assert.match(
    api,
    /path === "\/office\/partners" \|\| path\.startsWith\("\/office\/partners\/"\)/,
  );
  assert.match(api, /if \(!canAuthorOfficePartners\(session\)\)/);
});

test('runtime uses scoped durable authority only after global Office read is forbidden', () => {
  assert.match(officeRequest, /if \(response\.status === 403\)/);
  assert.match(
    officeRequest,
    /fetch\(`\$\{origin\(\)\}\/partner\/company-profile`/,
  );
  assert.match(officeRequest, /credentials: 'include'/);
  assert.match(officeRequest, /return \[asPartner\(scopedBody\.partner\)\]/);
});

test('runtime has no stale DSE customer fallback', () => {
  assert.doesNotMatch(officeRequest, /06123456/);
  assert.doesNotMatch(officeRequest, /Domy s energií s\.r\.o\./);
});
