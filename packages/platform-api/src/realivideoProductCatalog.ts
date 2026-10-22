export type RealivideoProduct = Readonly<{
  id: string;
  name: string;
  group: string;
  price: number;
}>;

export const REALIVIDEO_PRODUCTS: Readonly<Record<string, Omit<RealivideoProduct, 'id'>>> = Object.freeze({
  basic: { name: 'BALÍČEK BASIC', group: 'Prezentace nemovitostí', price: 2_970 },
  tip: { name: 'BALÍČEK TIP', group: 'Prezentace nemovitostí', price: 11_970 },
  top: { name: 'BALÍČEK TOP', group: 'Prezentace nemovitostí', price: 19_970 },
  photo: { name: 'Lokální fotografování', group: 'Volitelné služby', price: 4_970 },
  viz1: { name: '1 vizualizace navíc', group: 'Volitelné služby', price: 1_970 },
  viz3: { name: '3 vizualizace navíc', group: 'Volitelné služby', price: 3_970 },
  viz5: { name: '5 vizualizací navíc', group: 'Volitelné služby', price: 5_970 },
  tuning: { name: 'TUNING obrázků', group: 'Domy pro výstavbu', price: 9_970 },
  video: { name: 'Prodejní VIDEO', group: 'Domy pro výstavbu', price: 14_970 },
  viz: { name: 'VIZUALIZACE', group: 'Domy pro výstavbu', price: 19_970 },
});

const BROKER_BASES = new Set(['basic', 'tip', 'top']);
const BROKER_ADDONS = new Set(['photo', 'viz1', 'viz3', 'viz5']);
const VIZ_ADDONS = new Set(['viz1', 'viz3', 'viz5']);
const CANONICAL_ORDER = ['basic', 'tip', 'top', 'photo', 'viz1', 'viz3', 'viz5'];

export function resolveRealivideoProduct(productId: string): RealivideoProduct | null {
  const ids = productId.split('+').filter(Boolean);
  if (ids.length === 0 || new Set(ids).size !== ids.length) return null;

  if (ids.length === 1) {
    if (BROKER_ADDONS.has(ids[0]!)) return null;
    const item = REALIVIDEO_PRODUCTS[ids[0]!];
    return item ? { id: ids[0]!, ...item } : null;
  }

  const bases = ids.filter((id) => BROKER_BASES.has(id));
  const addons = ids.filter((id) => BROKER_ADDONS.has(id));
  if (bases.length !== 1 || bases.length + addons.length !== ids.length) return null;
  if (addons.filter((id) => VIZ_ADDONS.has(id)).length > 1) return null;

  const canonicalIds = [...ids].sort(
    (left, right) => CANONICAL_ORDER.indexOf(left) - CANONICAL_ORDER.indexOf(right),
  );
  if (canonicalIds.join('+') !== productId) return null;

  const items = canonicalIds.map((id) => REALIVIDEO_PRODUCTS[id]!);
  return {
    id: productId,
    name: items.map((item) => item.name).join(' + '),
    group: 'Prezentace nemovitostí + volitelné služby',
    price: items.reduce((sum, item) => sum + item.price, 0),
  };
}
