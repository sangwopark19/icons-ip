import 'server-only';

import { DATA, type Ip, type Vertical } from '@/lib/data';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface CatalogSnapshot {
  source: 'supabase' | 'mock';
  verticals: Vertical[];
  ips: Ip[];
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

const PUBLIC_MEDIA_BUCKET = 'public-media';
const PUBLIC_MEDIA_PREFIX = `${PUBLIC_MEDIA_BUCKET}/`;

const mockSnapshot = (): CatalogSnapshot => ({
  source: 'mock',
  verticals: Object.values(DATA.V),
  ips: DATA.IPS,
});

const fallbackVertical = (key: string): Vertical => ({
  key,
  label: key,
  color: '#8B5CFF',
});

const imageBg = (path: string) => `url("${path}") center / cover no-repeat`;

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
    bg: row.bg ?? (row.image_path ? imageBg(imageUrlForPath(row.image_path)) : DATA.IPS[0]?.bg ?? ''),
    fans: row.fans_count ?? 0,
    goods: row.goods_count ?? 0,
    cards: row.cards_count ?? 0,
    featured: row.featured,
    tagline: row.tagline ?? '',
    synopsis: row.synopsis ?? '',
  };
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  if (!getSupabaseConfig().isConfigured) return mockSnapshot();

  const supabase = await createClient();

  const [verticalsResult, ipsResult] = await Promise.all([
    supabase.from('verticals').select('key,label,color').order('key'),
    supabase
      .from('ips')
      .select('id,title,sub,vertical_key,tagline,synopsis,glyph,bg,image_path,featured,fans_count,goods_count,cards_count')
      .order('featured', { ascending: false })
      .order('fans_count', { ascending: false }),
  ]);

  if (verticalsResult.error) {
    throw new Error(`Failed to load catalog verticals: ${verticalsResult.error.message}`);
  }

  if (ipsResult.error) {
    throw new Error(`Failed to load catalog IPs: ${ipsResult.error.message}`);
  }

  const verticals = (verticalsResult.data ?? []) as VerticalRow[];
  const verticalsByKey = new Map(verticals.map((vertical) => [vertical.key, vertical]));
  const imageUrlForPath = (path: string) => {
    const { data } = supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .getPublicUrl(normalizePublicMediaPath(path));
    return data.publicUrl;
  };

  return {
    source: 'supabase',
    verticals,
    ips: ((ipsResult.data ?? []) as IpRow[]).map((row) => toIp(row, verticalsByKey, imageUrlForPath)),
  };
}

export async function getCatalogIp(id: string): Promise<Ip | null> {
  const catalog = await getCatalogSnapshot();
  return catalog.ips.find((ip) => ip.id === id) ?? null;
}
