import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildWorkspaceBreadcrumb } from './platformBreadcrumbContract';

describe('TASK 80 global Workspace breadcrumb contract', () => {
  it('uses canonical Workspace / Project / Studio order', () => {
    const breadcrumb = buildWorkspaceBreadcrumb({
      projectSlug: 'domy-s-energii',
      studioLabel: 'Manager Studio',
      trailing: [{ id: 'section', label: 'Přehled' }],
    });

    assert.deepEqual(
      breadcrumb.map((item) => item.label),
      [
        'CONIS',
        'Workspace',
        'domy-s-energii',
        'Manager Studio',
        'Přehled',
      ],
    );
  });

  it('does not derive user-facing identity from company id', () => {
    const breadcrumb = buildWorkspaceBreadcrumb({
      projectSlug: 'domy-s-energii',
      studioLabel: 'Sales Studio',
    });

    assert.equal(
      breadcrumb.some((item) => item.label.startsWith('company-')),
      false,
    );
  });

  it('fails closed without authoritative Project.slug', () => {
    assert.throws(() =>
      buildWorkspaceBreadcrumb({
        projectSlug: '   ',
        studioLabel: 'Client Studio',
      }),
    );
  });
});
