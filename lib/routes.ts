/* prototype route-id -> Next.js path mapping + nav config */

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'iphub', label: '탐색' },
  { id: 'shop', label: '굿즈샵' },
  { id: 'events', label: '팝업' },
  { id: 'community', label: '커뮤니티' },
];

export const MOB_ITEMS: NavItem[] = [
  { id: 'iphub', label: '탐색', icon: 'ip' },
  { id: 'shop', label: '굿즈샵', icon: 'bag' },
  { id: 'events', label: '팝업', icon: 'event' },
  { id: 'community', label: '커뮤니티', icon: 'chat' },
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
