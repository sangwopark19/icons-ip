'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CatalogSnapshot } from '@/lib/catalog';
import type { Good, Ip, Stock } from '@/lib/data';
import { hrefFor } from '@/lib/routes';
import {
  ALL_IPS,
  ALL_TYPES,
  featuredGoods,
  goodsTypeOptions,
  GOODS_SORTS,
  groupGoodsByIp,
  isShopLandingView,
  selectShopGoods,
  type GoodsSort,
} from '@/lib/shop-catalog';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';
import { Empty } from '@/components/ui/Empty';
import { useGo } from '@/components/shell/useGo';
import { useCart } from '@/components/shell/CartProvider';

const STOCK_LABEL: Record<Stock, string | null> = { low: '품절임박', soldout: '품절', ok: null };
const krw = (n: number) => '₩' + n.toLocaleString('ko-KR');

function ShopGoodsCard({ g, ip, onAdd }: { g: Good; ip?: Ip; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const stockLabel = STOCK_LABEL[g.stock];
  const sold = g.stock === 'soldout';
  const accent = ip?.v.color ?? 'var(--violet-2)';

  return (
    <div className="card lift" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Poster bg={g.img} glyph={ip?.glyph} showGlyph={false} ratio="1 / 1" radius={0}>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: 6 }}>
          {g.badge && <span className="tag" style={{ color: '#0A0813', background: 'var(--lime)', border: 'none', fontWeight: 700 }}>{g.badge}</span>}
          {stockLabel && (
            <span className="tag" style={{ color: '#fff', background: sold ? 'rgba(0,0,0,.6)' : 'var(--pink)', border: 'none' }}>{stockLabel}</span>
          )}
        </div>
      </Poster>
      <div style={{ padding: '13px 15px 15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="row" style={{ gap: 7 }}>
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 99, background: accent, flex: '0 0 auto' }} />
          <span className="mono" style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ip?.title} · {g.type}</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6, lineHeight: 1.3, minHeight: 36 }}>{g.name}</div>
        <div className="between" style={{ marginTop: 'auto', paddingTop: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--ff-display)' }}>{krw(g.price)}</span>
          <button
            className="icon-btn"
            disabled={sold}
            aria-label={sold ? '품절' : added ? '장바구니에 담음' : '장바구니 담기'}
            onClick={() => {
              if (sold) return;
              onAdd();
              setAdded(true);
              setTimeout(() => setAdded(false), 1100);
            }}
            style={{
              background: added ? 'var(--mint)' : 'rgba(255,255,255,.05)',
              color: added ? '#0A0813' : sold ? 'var(--faint)' : 'var(--text)',
              width: 38,
              height: 38,
            }}
          >
            <Icon name={added ? 'check' : 'plus'} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

const GRID_COLUMNS = 'repeat(auto-fill, minmax(210px, 1fr))';

export function Shop({ catalog }: { catalog: Pick<CatalogSnapshot, 'ips' | 'goods'> }) {
  const go = useGo();
  const { add, count } = useCart();
  const [ipF, setIpF] = useState(ALL_IPS);
  const [typeF, setTypeF] = useState(ALL_TYPES);
  const [sort, setSort] = useState<GoodsSort>('추천순');

  const ipsById = new Map(catalog.ips.map((ip) => [ip.id, ip]));
  const types = goodsTypeOptions(catalog.goods);
  const filter = { ipId: ipF, type: typeF, sort };
  const visible = selectShopGoods(catalog.goods, filter);
  const landing = isShopLandingView(filter);
  const featured = landing ? featuredGoods(visible) : [];
  const groups = landing ? groupGoodsByIp(visible, catalog.ips) : [];

  return (
    <div className="screen">
      {/* 사요 · 공식 굿즈 월드 헤더 */}
      <div className="wrap" style={{ paddingTop: 48 }}>
        <div className="eyebrow" style={{ color: 'var(--amber)', marginBottom: 14 }}>사요 · 공식 굿즈</div>
        <div className="between" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <h1 className="h-xl">굿즈샵</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
              IP 파트너와 직접 계약한 공식 라이선스 한정 굿즈. 최애의 세계를 손에 담으세요.
            </p>
          </div>
          <button className="btn btn-holo" onClick={() => go('cart')}>
            <Icon name="bag" size={16} /> 장바구니{count > 0 ? ` ${count}` : ''}
          </button>
        </div>
      </div>

      {/* sticky 탐색 바 — IP · 유형 */}
      <div className="shop-toolbar">
        <div className="wrap shop-toolbar-inner">
          <div className="shop-toolbar-row" role="group" aria-label="IP 필터">
            <button className={'chip' + (ipF === ALL_IPS ? ' on' : '')} aria-pressed={ipF === ALL_IPS} onClick={() => setIpF(ALL_IPS)}>전체 IP</button>
            {catalog.ips.map((ip) => (
              <button
                key={ip.id}
                className={'chip' + (ipF === ip.id ? ' on accent' : '')}
                aria-pressed={ipF === ip.id}
                onClick={() => setIpF(ip.id)}
                style={ipF === ip.id ? { background: ip.v.color, borderColor: ip.v.color, color: '#0A0813' } : {}}
              >
                {ip.title}
              </button>
            ))}
          </div>
          <div className="shop-toolbar-row" role="group" aria-label="유형 필터">
            <button className={'chip btn-sm' + (typeF === ALL_TYPES ? ' on' : '')} aria-pressed={typeF === ALL_TYPES} onClick={() => setTypeF(ALL_TYPES)}>전체 유형</button>
            {types.map((t) => (
              <button key={t} className={'chip btn-sm' + (typeF === t ? ' on' : '')} aria-pressed={typeF === t} onClick={() => setTypeF(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 수 · 정렬 */}
      <div className="wrap">
        <div className="between" style={{ marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
          <span className="faint mono" style={{ fontSize: 12 }}>총 {visible.length}개 상품</span>
          <div className="wrapgap" role="group" aria-label="정렬">
            {GOODS_SORTS.map((s) => (
              <button key={s} className={'chip btn-sm' + (sort === s ? ' on' : '')} aria-pressed={sort === s} onClick={() => setSort(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className="wrap" style={{ paddingBottom: 80 }}>
        {visible.length === 0 ? (
          <div style={{ marginTop: 28 }}>
            <Empty
              icon="bag"
              text={catalog.goods.length ? '조건에 맞는 굿즈가 없어요' : '등록된 굿즈가 아직 없습니다'}
              sub={catalog.goods.length ? '필터를 바꿔보세요' : 'Supabase 카탈로그 seed 또는 admin 등록 후 굿즈샵에 공개됩니다.'}
            />
          </div>
        ) : landing ? (
          <>
            {featured.length > 0 && (
              <section style={{ marginTop: 30 }}>
                <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--amber)', textTransform: 'uppercase' }}>지금 주목 · 한정 신상</span>
                  <span className="faint mono" style={{ fontSize: 13 }}>{featured.length}</span>
                </div>
                <div className="shop-rail" style={{ marginTop: 18 }}>
                  {featured.map((g) => <ShopGoodsCard key={g.id} g={g} ip={ipsById.get(g.ip)} onAdd={add} />)}
                </div>
              </section>
            )}
            {groups.map(({ ip, goods }) => (
              <section key={ip.id} className="shop-section">
                <div className="between" style={{ gap: 14, flexWrap: 'wrap' }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 99, background: ip.v.color, flex: '0 0 auto' }} />
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{ip.title}</span>
                    <span className="faint mono" style={{ fontSize: 12 }}>{ip.v.label} · {goods.length}</span>
                  </div>
                  <Link className="btn btn-ghost btn-sm" href={hrefFor('ip', ip.id)}>
                    IP 허브 <Icon name="arrow" size={14} />
                  </Link>
                </div>
                <div className="grid" style={{ gridTemplateColumns: GRID_COLUMNS, marginTop: 18 }}>
                  {goods.map((g) => <ShopGoodsCard key={g.id} g={g} ip={ip} onAdd={add} />)}
                </div>
              </section>
            ))}
          </>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: GRID_COLUMNS, marginTop: 24 }}>
            {visible.map((g) => <ShopGoodsCard key={g.id} g={g} ip={ipsById.get(g.ip)} onAdd={add} />)}
          </div>
        )}
      </div>
    </div>
  );
}
