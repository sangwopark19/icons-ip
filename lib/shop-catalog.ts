import type { Good, Ip } from './data';

export type GoodsSort = '추천순' | '낮은 가격순' | '높은 가격순';

export const GOODS_SORTS: GoodsSort[] = ['추천순', '낮은 가격순', '높은 가격순'];

export const ALL_IPS = 'all';
export const ALL_TYPES = '전체';

export interface ShopGoodsFilter {
  ipId: string;
  type: string;
  sort: GoodsSort;
}

export interface ShopIpGroup {
  ip: Ip;
  goods: Good[];
}

export function goodsTypeOptions(goods: Good[]): string[] {
  return Array.from(new Set(goods.map((good) => good.type)));
}

export function selectShopGoods(goods: Good[], filter: ShopGoodsFilter): Good[] {
  const filtered = goods.filter(
    (good) =>
      (filter.ipId === ALL_IPS || good.ip === filter.ipId) &&
      (filter.type === ALL_TYPES || good.type === filter.type),
  );

  if (filter.sort === '낮은 가격순') return [...filtered].sort((a, b) => a.price - b.price);
  if (filter.sort === '높은 가격순') return [...filtered].sort((a, b) => b.price - a.price);
  return filtered;
}

// 한정·신상·예약처럼 badge가 붙은 구매 가능한 굿즈만 "지금 주목" 레일에 노출한다.
export function featuredGoods(goods: Good[], limit = 8): Good[] {
  return goods.filter((good) => good.badge !== null && good.stock !== 'soldout').slice(0, limit);
}

export function groupGoodsByIp(goods: Good[], ips: Ip[]): ShopIpGroup[] {
  return ips
    .map((ip) => ({ ip, goods: goods.filter((good) => good.ip === ip.id) }))
    .filter((group) => group.goods.length > 0);
}

// 전체 IP를 추천순으로 볼 때만 레일 + IP별 섹션 그룹핑 랜딩을 보여주고,
// 특정 IP를 고르거나 가격순으로 정렬하면 평면 결과 그리드로 전환한다.
export function isShopLandingView(filter: ShopGoodsFilter): boolean {
  return filter.ipId === ALL_IPS && filter.sort === '추천순';
}
