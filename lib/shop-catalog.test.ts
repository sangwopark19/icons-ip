import { describe, expect, it } from 'vitest';
import type { Good, Ip, Stock, Vertical } from './data';
import {
  ALL_IPS,
  ALL_TYPES,
  featuredGoods,
  goodsTypeOptions,
  groupGoodsByIp,
  isShopLandingView,
  selectShopGoods,
} from './shop-catalog';

const vertical: Vertical = { key: 'global', label: '글로벌 IP', color: '#2DE2FF' };

function ip(id: string, featured = false): Ip {
  return {
    id,
    title: `IP ${id}`,
    sub: '',
    v: vertical,
    glyph: id.toUpperCase(),
    bg: `bg-${id}`,
    fans: 0,
    goods: 0,
    cards: 0,
    featured,
    tagline: '',
    synopsis: '',
  };
}

function good(id: string, ipId: string, overrides: Partial<Good> = {}): Good {
  return {
    id,
    ip: ipId,
    name: `Good ${id}`,
    type: '키링',
    price: 10000,
    badge: null,
    stock: 'ok' as Stock,
    img: `good-${id}`,
    ...overrides,
  };
}

describe('goodsTypeOptions', () => {
  it('중복을 제거하고 처음 등장한 순서를 유지한다', () => {
    const goods = [
      good('a', 'ip1', { type: '키링' }),
      good('b', 'ip1', { type: '피규어' }),
      good('c', 'ip2', { type: '키링' }),
      good('d', 'ip2', { type: '의류' }),
    ];
    expect(goodsTypeOptions(goods)).toEqual(['키링', '피규어', '의류']);
  });
});

describe('selectShopGoods', () => {
  const goods = [
    good('a', 'ip1', { type: '키링', price: 30000 }),
    good('b', 'ip1', { type: '피규어', price: 10000 }),
    good('c', 'ip2', { type: '키링', price: 20000 }),
  ];

  it('IP와 유형으로 필터링한다', () => {
    expect(selectShopGoods(goods, { ipId: 'ip1', type: ALL_TYPES, sort: '추천순' }).map((g) => g.id)).toEqual(['a', 'b']);
    expect(selectShopGoods(goods, { ipId: ALL_IPS, type: '키링', sort: '추천순' }).map((g) => g.id)).toEqual(['a', 'c']);
  });

  it('가격순으로 오름/내림차순 정렬한다', () => {
    expect(selectShopGoods(goods, { ipId: ALL_IPS, type: ALL_TYPES, sort: '낮은 가격순' }).map((g) => g.id)).toEqual(['b', 'c', 'a']);
    expect(selectShopGoods(goods, { ipId: ALL_IPS, type: ALL_TYPES, sort: '높은 가격순' }).map((g) => g.id)).toEqual(['a', 'c', 'b']);
  });

  it('추천순은 원본 순서를 유지하고 입력 배열을 변형하지 않는다', () => {
    const input = [...goods];
    expect(selectShopGoods(input, { ipId: ALL_IPS, type: ALL_TYPES, sort: '추천순' }).map((g) => g.id)).toEqual(['a', 'b', 'c']);
    selectShopGoods(input, { ipId: ALL_IPS, type: ALL_TYPES, sort: '낮은 가격순' });
    expect(input.map((g) => g.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('featuredGoods', () => {
  it('badge가 있고 품절이 아닌 굿즈만 노출한다', () => {
    const goods = [
      good('a', 'ip1', { badge: '한정' }),
      good('b', 'ip1', { badge: null }),
      good('c', 'ip2', { badge: '신상', stock: 'soldout' }),
      good('d', 'ip2', { badge: '예약', stock: 'low' }),
    ];
    expect(featuredGoods(goods).map((g) => g.id)).toEqual(['a', 'd']);
  });

  it('입력 순서대로 앞에서부터 limit만큼만 노출한다', () => {
    const goods = Array.from({ length: 10 }, (_, i) => good(`g${i}`, 'ip1', { badge: '한정' }));
    expect(featuredGoods(goods, 3).map((g) => g.id)).toEqual(['g0', 'g1', 'g2']);
  });
});

describe('groupGoodsByIp', () => {
  it('IP 순서를 유지하고 굿즈가 없는 IP는 제외한다', () => {
    const ips = [ip('ip1'), ip('ip2'), ip('ip3')];
    const goods = [good('a', 'ip2'), good('b', 'ip1'), good('c', 'ip2')];
    const groups = groupGoodsByIp(goods, ips);
    expect(groups.map((group) => group.ip.id)).toEqual(['ip1', 'ip2']);
    expect(groups[1].goods.map((g) => g.id)).toEqual(['a', 'c']);
  });
});

describe('isShopLandingView', () => {
  it('전체 IP + 추천순일 때만 랜딩 뷰다', () => {
    expect(isShopLandingView({ ipId: ALL_IPS, type: ALL_TYPES, sort: '추천순' })).toBe(true);
    expect(isShopLandingView({ ipId: ALL_IPS, type: '키링', sort: '추천순' })).toBe(true);
    expect(isShopLandingView({ ipId: 'ip1', type: ALL_TYPES, sort: '추천순' })).toBe(false);
    expect(isShopLandingView({ ipId: ALL_IPS, type: ALL_TYPES, sort: '낮은 가격순' })).toBe(false);
  });
});
