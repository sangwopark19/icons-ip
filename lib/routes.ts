/* prototype route-id -> Next.js path mapping + nav config */

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '홈' },
  { id: 'iphub', label: 'IP' },
  { id: 'shop', label: '굿즈샵' },
  { id: 'binder', label: '카드' },
  { id: 'events', label: '팝업' },
  { id: 'community', label: '커뮤니티' },
  { id: 'exchange', label: '교환' },
  { id: 'market', label: '마켓' },
];

export const MOB_ITEMS: NavItem[] = [
  { id: 'home', label: '홈', icon: 'home' },
  { id: 'iphub', label: 'IP', icon: 'ip' },
  { id: 'binder', label: '카드', icon: 'card' },
  { id: 'community', label: '피드', icon: 'chat' },
  { id: 'shop', label: '굿즈', icon: 'bag' },
];

const PATHS: Record<string, string> = {
  home: '/',
  iphub: '/ip',
  shop: '/shop',
  binder: '/binder',
  events: '/events',
  community: '/community',
  exchange: '/exchange',
  market: '/market',
  search: '/search',
  login: '/login',
  cart: '/shop', // prototype had no dedicated cart route
};

export function hrefFor(route: string, param?: string | null): string {
  if (route === 'ip') return param ? `/ip/${param}` : '/ip';
  return PATHS[route] ?? '/';
}

/** does the given prototype route-id correspond to the current pathname? */
export function isActive(route: string, pathname: string): boolean {
  const href = hrefFor(route);
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
