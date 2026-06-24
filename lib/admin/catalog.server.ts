import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { RarityKey } from '@/lib/rarity';
import type { Stock } from '@/lib/data';

export interface AdminIpRecord {
  id: string;
  title: string;
  sub: string | null;
  verticalKey: string;
  tagline: string | null;
  synopsis: string | null;
  glyph: string | null;
  bg: string | null;
  imagePath: string | null;
  featured: boolean;
  fansCount: number;
}

export interface AdminGoodRecord {
  id: string;
  ipId: string;
  name: string;
  type: string;
  price: number;
  badge: string | null;
  stock: Stock;
  stockQty: number;
  bg: string | null;
  imagePath: string | null;
}

export interface AdminCardRecord {
  id: string;
  ipId: string;
  name: string;
  no: string | null;
  rarity: RarityKey;
  bg: string | null;
  imagePath: string | null;
}

export interface AdminEventRecord {
  id: string;
  ipId: string | null;
  title: string;
  mode: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  accent: string | null;
  bg: string | null;
  imagePath: string | null;
}

export interface AdminCatalogRecords {
  ips: AdminIpRecord[];
  goods: AdminGoodRecord[];
  cards: AdminCardRecord[];
  events: AdminEventRecord[];
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
}

interface GoodRow {
  id: string;
  ip_id: string;
  name: string;
  type: string;
  price: number;
  badge: string | null;
  stock: Stock;
  stock_qty: number | null;
  bg: string | null;
  image_path: string | null;
}

interface CardRow {
  id: string;
  ip_id: string;
  name: string;
  no: string | null;
  rarity: RarityKey;
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

export async function getAdminCatalogRecords(): Promise<AdminCatalogRecords> {
  const supabase = await createClient();
  const [ipsResult, goodsResult, cardsResult, eventsResult] = await Promise.all([
    supabase
      .from('ips')
      .select('id,title,sub,vertical_key,tagline,synopsis,glyph,bg,image_path,featured,fans_count')
      .order('id'),
    supabase
      .from('goods')
      .select('id,ip_id,name,type,price,badge,stock,stock_qty,bg,image_path')
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

  if (ipsResult.error) throw new Error(`Failed to load admin IPs: ${ipsResult.error.message}`);
  if (goodsResult.error) throw new Error(`Failed to load admin goods: ${goodsResult.error.message}`);
  if (cardsResult.error) throw new Error(`Failed to load admin cards: ${cardsResult.error.message}`);
  if (eventsResult.error) throw new Error(`Failed to load admin events: ${eventsResult.error.message}`);

  return {
    ips: ((ipsResult.data ?? []) as IpRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      sub: row.sub,
      verticalKey: row.vertical_key,
      tagline: row.tagline,
      synopsis: row.synopsis,
      glyph: row.glyph,
      bg: row.bg,
      imagePath: row.image_path,
      featured: row.featured,
      fansCount: row.fans_count ?? 0,
    })),
    goods: ((goodsResult.data ?? []) as GoodRow[]).map((row) => ({
      id: row.id,
      ipId: row.ip_id,
      name: row.name,
      type: row.type,
      price: row.price,
      badge: row.badge,
      stock: row.stock,
      stockQty: row.stock_qty ?? 0,
      bg: row.bg,
      imagePath: row.image_path,
    })),
    cards: ((cardsResult.data ?? []) as CardRow[]).map((row) => ({
      id: row.id,
      ipId: row.ip_id,
      name: row.name,
      no: row.no,
      rarity: row.rarity,
      bg: row.bg,
      imagePath: row.image_path,
    })),
    events: ((eventsResult.data ?? []) as EventRow[]).map((row) => ({
      id: row.id,
      ipId: row.ip_id,
      title: row.title,
      mode: row.mode,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      location: row.location,
      accent: row.accent,
      bg: row.bg,
      imagePath: row.image_path,
    })),
  };
}
