import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveRealivideoProduct } from './realivideoProductCatalog.ts';

test('resolves a broker package with optional services and exact total', () => {
  assert.deepEqual(resolveRealivideoProduct('tip+photo+viz3'), {
    id: 'tip+photo+viz3',
    name: 'BALÍČEK TIP + Lokální fotografování + 3 vizualizace navíc',
    group: 'Prezentace nemovitostí + volitelné služby',
    price: 20_910,
  });
});

test('rejects multiple visualization tiers and non-canonical combinations', () => {
  assert.equal(resolveRealivideoProduct('tip+viz1+viz3'), null);
  assert.equal(resolveRealivideoProduct('photo+tip'), null);
  assert.equal(resolveRealivideoProduct('photo'), null);
});
