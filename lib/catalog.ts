import 'server-only';

import { DATA, type Card, type FandomEvent, type Good, type Ip, type RarityKey, type Stock, type Vertical } from '@/lib/data';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface CatalogSnapshot {
  source: 'supabase' | 'mock';
  verticals: Vertical[];
  ips: Ip[];
  goods: Good[];
  cards: Card[];
  events: FandomEvent[];
}

interface VerticalRow {
  key: string;
  label: string;
  color: string;
}

interface IpRow {
  id: string;
  title: string;
  sub: string | null;
  vertical_key: string;
  tagline: string | null;
  synopsis: string | null;
  glyph: string | null;
  bg: string | null;
  image_path: string | null;
  featured: boolean;
  fans_count: number;
  goods_count: number;
  cards_count: number;
}

interface GoodRow {
  id: string;
  ip_id: string;
  name: string;
  type: string;
  price: number;
  badge: string | null;
  stock: string;
  bg: string | null;
  image_path: string | null;
}

interface CardRow {
  id: string;
  ip_id: string;
  name: string;
  no: string | null;
  rarity: string;
  bg: string | null;
  image_path: string | null;
}

interface EventRow {
  id: string;
  ip_id: string | null;
  title: string;
  mode: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  accent: string | null;
  bg: string | null;
  image_path: string | null;
}

const PUBLIC_MEDIA_BUCKET = 'public-media';
const PUBLIC_MEDIA_PREFIX = `${PUBLIC_MEDIA_BUCKET}/`;
const RARITIES: RarityKey[] = ['N', 'R', 'SR', 'SSR', 'HOLO'];
const naturalIdCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

const mockSnapshot = (): CatalogSnapshot => ({
  source: 'mock',
  verticals: Object.values(DATA.V),
  ips: DATA.IPS,
  goods: DATA.GOODS,
  cards: DATA.CARDS,
  events: DATA.EVENTS,
});

const fallbackVertical = (key: string): Vertical => ({
  key,
  label: key,
  color: '#8B5CFF',
});

const imageBg = (path: string) => `url("${path}") center / cover no-repeat`;

function backgroundFor(
  bg: string | null,
  imagePath: string | null,
  imageUrlForPath: (path: string) => string,
  fallback: string,
) {
  return imagePath ? imageBg(imageUrlForPath(imagePath)) : bg ?? fallback;
}

function byNaturalId<T extends { id: string }>(a: T, b: T) {
  return naturalIdCollator.compare(a.id, b.id);
}

function toStock(stock: string): Stock {
  return stock === 'low' || stock === 'soldout' ? stock : 'ok';
}

function toRarity(rarity: string): RarityKey {
  return RARITIES.includes(rarity as RarityKey) ? (rarity as RarityKey) : 'N';
}

function normalizePublicMediaPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, '');
  return normalizedPath.startsWith(PUBLIC_MEDIA_PREFIX)
    ? normalizedPath.slice(PUBLIC_MEDIA_PREFIX.length)
    : normalizedPath;
}

function toIp(row: IpRow, verticalsByKey: Map<string, Vertical>, imageUrlForPath: (path: string) => string): Ip {
  return {
    id: row.id,
    title: row.title,
    sub: row.sub ?? '',
    v: verticalsByKey.get(row.vertical_key) ?? fallbackVertical(row.vertical_key),
    glyph: row.glyph ?? row.title,
    bg: backgroundFor(row.bg, row.image_path, imageUrlForPath, DATA.IPS[0]?.bg ?? ''),
    fans: row.fans_count ?? 0,
    goods: row.goods_count ?? 0,
    cards: row.cards_count ?? 0,
    featured: row.featured,
    tagline: row.tagline ?? '',
    synopsis: row.synopsis ?? '',
  };
}

function toGood(row: GoodRow, imageUrlForPath: (path: string) => string): Good {
  return {
    id: row.id,
    ip: row.ip_id,
    name: row.name,
    type: row.type,
    price: row.price,
    badge: row.badge,
    stock: toStock(row.stock),
    img: backgroundFor(row.bg, row.image_path, imageUrlForPath, DATA.GOODS[0]?.img ?? ''),
  };
}

function toCard(row: CardRow, imageUrlForPath: (path: string) => string): Card {
  return {
    id: row.id,
    ip: row.ip_id,
    name: row.name,
    no: row.no ?? '',
    rarity: toRarity(row.rarity),
    owned: false,
    bg: backgroundFor(row.bg, row.image_path, imageUrlForPath, DATA.CARDS[0]?.bg ?? ''),
  };
}

function eventDateParts(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

function formatEventDate(startsAt: string | null, endsAt: string | null) {
  if (!startsAt) return '';

  const start = eventDateParts(startsAt);
  const startDate = `${start.month}.${start.day}`;
  const startTime = start.hour === '00' && start.minute === '00' ? '' : ` ${start.hour}:${start.minute}`;

  if (!endsAt) return `${startDate}${startTime}`;

  const end = eventDateParts(endsAt);
  const endDate = `${end.month}.${end.day}`;
  return startDate === endDate ? `${startDate}${startTime}` : `${startDate} - ${endDate}`;
}

function toEvent(row: EventRow, ipsById: Map<string, Ip>, imageUrlForPath: (path: string) => string): FandomEvent {
  const ip = row.ip_id ? ipsById.get(row.ip_id) : null;
  return {
    id: row.id,
    ip: row.ip_id,
    title: row.title,
    mode: row.mode,
    status: row.status,
    date: formatEventDate(row.starts_at, row.ends_at),
    loc: row.location ?? '',
    accent: row.accent ?? ip?.v.color ?? '#8B5CFF',
    img: backgroundFor(row.bg, row.image_path, imageUrlForPath, ip?.bg ?? DATA.EVENTS[0]?.img ?? ''),
  };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  if (!getSupabaseConfig().isConfigured) return mockSnapshot();

  const supabase = await createClient();

  const [verticalsResult, ipsResult, goodsResult, cardsResult, eventsResult] = await Promise.all([
    supabase.from('verticals').select('key,label,color').order('key'),
    supabase
      .from('ips')
      .select('id,title,sub,vertical_key,tagline,synopsis,glyph,bg,image_path,featured,fans_count,goods_count,cards_count')
      .order('featured', { ascending: false })
      .order('fans_count', { ascending: false }),
    supabase
      .from('goods')
      .select('id,ip_id,name,type,price,badge,stock,bg,image_path')
      .order('id'),
    supabase
      .from('cards')
      .select('id,ip_id,name,no,rarity,bg,image_path')
      .order('id'),
    supabase
      .from('events')
      .select('id,ip_id,title,mode,status,starts_at,ends_at,location,accent,bg,image_path')
      .order('id'),
  ]);

  if (verticalsResult.error) {
    throw new Error(`Failed to load catalog verticals: ${verticalsResult.error.message}`);
  }

  if (ipsResult.error) {
    throw new Error(`Failed to load catalog IPs: ${ipsResult.error.message}`);
  }
  if (goodsResult.error) {
    throw new Error(`Failed to load catalog goods: ${goodsResult.error.message}`);
  }
  if (cardsResult.error) {
    throw new Error(`Failed to load catalog cards: ${cardsResult.error.message}`);
  }
  if (eventsResult.error) {
    throw new Error(`Failed to load catalog events: ${eventsResult.error.message}`);
  }

  const verticals = (verticalsResult.data ?? []) as VerticalRow[];
  const verticalsByKey = new Map(verticals.map((vertical) => [vertical.key, vertical]));
  const imageUrlForPath = (path: string) => {
    const { data } = supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .getPublicUrl(normalizePublicMediaPath(path));
    return data.publicUrl;
  };
  const ips = ((ipsResult.data ?? []) as IpRow[]).map((row) => toIp(row, verticalsByKey, imageUrlForPath));
  const goods = ((goodsResult.data ?? []) as GoodRow[]).map((row) => toGood(row, imageUrlForPath)).sort(byNaturalId);
  const cards = ((cardsResult.data ?? []) as CardRow[]).map((row) => toCard(row, imageUrlForPath)).sort(byNaturalId);
  const events = ((eventsResult.data ?? []) as EventRow[])
    .map((row) => toEvent(row, new Map(ips.map((ip) => [ip.id, ip])), imageUrlForPath))
    .sort(byNaturalId);

  return {
    source: 'supabase',
    verticals,
    ips,
    goods,
    cards,
    events,
  };
}

export async function getCatalogIp(id: string): Promise<Ip | null> {
  const catalog = await getCatalogSnapshot();
  return catalog.ips.find((ip) => ip.id === id) ?? null;
}
