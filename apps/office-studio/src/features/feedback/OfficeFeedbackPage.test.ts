import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

test('Office Feedback is a dedicated list/detail view backed by existing endpoints', () => {
  const source=readFileSync(fileURLToPath(new URL('./OfficeFeedbackPage.tsx',import.meta.url)),'utf8');
  assert.match(source,/listManagerFeedback/); assert.match(source,/getManagerFeedback/);
  for(const field of ['Datum a čas','Autor / účet','Projekt','Zdroj','Stav','Detail feedbacku']) assert.match(source,new RegExp(field));
  assert.match(source,/office-feedback__list/); assert.match(source,/office-feedback__detail/);
});
