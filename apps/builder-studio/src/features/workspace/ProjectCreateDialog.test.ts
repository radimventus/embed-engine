import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./ProjectCreateDialog.tsx', import.meta.url)),
  'utf8',
);

describe('ProjectCreateDialog canonical Partner flow', () => {
  it('CAP-VR44B2 creates a shared canonical Partner and selects it for the Project', () => {
    assert.match(source, /createCanonicalPartner\(\{ name: partnerName \}\)/);
    assert.match(source, /id: created\.companyId/);
    assert.match(source, /setCompanyId\(company\.id\)/);
    assert.match(source, /companiesWithCreated/);
    assert.match(source, /\+ Nový partner/);
    assert.match(source, /setPartnerFormOpen\(false\)/);
    assert.match(source, /partnerSelectRef\.current/);
  });

  it('keeps the required existing Partner selection and Project fields', () => {
    assert.match(source, /<option value="" disabled>/);
    assert.match(source, /Vyberte partnera…/);
    assert.match(source, /if \(companyId\.length === 0 \|\| submitting\) return/);
    assert.match(source, /value=\{name\}/);
    assert.match(source, /value=\{description\}/);
  });

  it('CAP-VR44R2 keeps failed Project creation actionable inside the dialog', () => {
    assert.match(source, /const \[submitting, setSubmitting\] = useState\(false\)/);
    assert.match(source, /const \[projectError, setProjectError\] = useState<string \| null>\(null\)/);
    assert.match(source, /busy=\{busy \|\| submitting\}/);
    assert.match(source, /if \(companyId\.length === 0 \|\| submitting\) return/);
    assert.match(source, /setProjectError\(error\)/);
    assert.match(source, /Nepodařilo se založit projekt\./);
    assert.match(source, /setSubmitting\(false\)/);
    assert.match(source, /role="alert"/);
  });
});
