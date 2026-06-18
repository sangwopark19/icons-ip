'use client';

import { useState } from 'react';
import { DATA, type Good, type Stock } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { Poster } from '@/components/ui/Poster';
import { Empty } from '@/components/ui/Empty';
import { useGo, type Go } from '@/components/shell/useGo';
import { useCart } from '@/components/shell/CartProvider';

const STOCK_LABEL: Record<Stock, string | null> = { low: '품절임박', soldout: '품절', ok: null };

function ShopCard({ g, addCart }: { g: Good; addCart: () => void }) {
  const ip = DATA.ipById(g.ip);
  const [added, setAdded] = useState(false);
  const stockLabel = STOCK_LABEL[g.stock];
  const sold = g.stock === 'soldout';
  return (
    <div className="card lift" style={{ padding: 0, overflow: 'hidden' }}>
      <Poster bg={g.img} glyph={ip?.glyph} showGlyph={false} ratio="1 / 1" radius={0}>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: 6 }}>
          {g.badge && <span className="tag" style={{ color: '#0A0813', background: 'var(--lime)', border: 'none', fontWeight: 700 }}>{g.badge}</span>}
          {stockLabel && (
            <span className="tag" style={{ color: '#fff', background: sold ? 'rgba(0,0,0,.6)' : 'var(--pink)', border: 'none' }}>{stockLabel}</span>
          )}
        </div>
      </Poster>
      <div style={{ padding: '14px 15px 16px' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{ip?.title} · {g.type}</div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 5, lineHeight: 1.3, minHeight: 36 }}>{g.name}</div>
        <div className="between" style={{ marginTop: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--ff-display)' }}>{DATA.krw(g.price)}</span>
          <button
            className="icon-btn"
            disabled={sold}
            onClick={() => {
              if (!sold) {
                addCart();
                setAdded(true);
                setTimeout(() => setAdded(false), 1100);
              }
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

export function Shop() {
  const go: Go = useGo();
  const { add } = useCart();
  const [ipF, setIpF] = useState('all');
  const [typeF, setTypeF] = useState('전체');
  const [sort, setSort] = useState('추천순');

  let list = DATA.GOODS.filter((g) => (ipF === 'all' || g.ip === ipF) && (typeF === '전체' || g.type === typeF));
  if (sort === '낮은 가격순') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === '높은 가격순') list = [...list].sort((a, b) => b.price - a.price);

  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Official Goods</div>
        <div className="between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="h-xl">굿즈샵</h1>
            <p className="muted" style={{ marginTop: 10 }}>IP 파트너와 직접 계약한 공식 라이선스 한정 굿즈.</p>
          </div>
          <button className="btn btn-holo" onClick={() => go('cart')}><Icon name="bag" size={16} /> 장바구니</button>
        </div>

        {/* IP filter */}
        <div className="wrapgap" style={{ marginTop: 28 }}>
          <button className={'chip' + (ipF === 'all' ? ' on' : '')} onClick={() => setIpF('all')}>전체 IP</button>
          {DATA.IPS.map((ip) => (
            <button
              key={ip.id}
              className={'chip' + (ipF === ip.id ? ' on accent' : '')}
              onClick={() => setIpF(ip.id)}
              style={ipF === ip.id ? { background: ip.v.color, borderColor: ip.v.color, color: '#0A0813' } : {}}
            >
              {ip.title}
            </button>
          ))}
        </div>
        {/* type + sort */}
        <div className="between" style={{ marginTop: 14, flexWrap: 'wrap', gap: 14 }}>
          <div className="wrapgap">
            <button className={'chip btn-sm' + (typeF === '전체' ? ' on' : '')} onClick={() => setTypeF('전체')}>전체 유형</button>
            {DATA.GOODS_TYPES.map((t) => (
              <button key={t} className={'chip btn-sm' + (typeF === t ? ' on' : '')} onClick={() => setTypeF(t)}>{t}</button>
            ))}
          </div>
          <div className="wrapgap">
            {['추천순', '낮은 가격순', '높은 가격순'].map((s) => (
              <button key={s} className={'chip btn-sm' + (sort === s ? ' on' : '')} onClick={() => setSort(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="faint mono" style={{ fontSize: 12, marginTop: 18 }}>총 {list.length}개 상품</div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', marginTop: 16 }}>
          {list.map((g) => <ShopCard key={g.id} g={g} addCart={add} />)}
        </div>
        {!list.length && <Empty icon="bag" text="조건에 맞는 굿즈가 없어요" sub="필터를 바꿔보세요" />}
      </div>
    </div>
  );
}
