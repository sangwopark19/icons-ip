'use client';

import { useState } from 'react';
import { DATA, type Exchange as ExchangeItem } from '@/lib/data';
import { Icon } from '@/components/ui/Icon';
import { RarityBadge } from '@/components/ui/RarityBadge';

function ExchangeCard({ x }: { x: ExchangeItem }) {
  const info = DATA.RARITY[x.rarity];
  const auction = x.kind === '경매';
  return (
    <div className="card" style={{ padding: 16, display: 'flex', gap: 14 }}>
      <div
        style={{
          width: 96,
          flex: '0 0 auto',
          position: 'relative',
          aspectRatio: '3/4.2',
          borderRadius: 12,
          overflow: 'hidden',
          background: x.bg,
          border: `1.5px solid ${info.color}`,
        }}
      >
        <div className="sheen" />
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}>
          <RarityBadge r={x.rarity} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="tag" style={{ color: '#0A0813', background: auction ? 'var(--amber)' : 'var(--cyan)', border: 'none', fontWeight: 700 }}>{x.kind}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>{x.card}</div>
        <div className="faint mono" style={{ fontSize: 11, marginTop: 3 }}>@{x.user}</div>
        {auction ? (
          <div style={{ marginTop: 'auto' }}>
            <div className="between" style={{ marginTop: 10 }}>
              <span className="muted mono" style={{ fontSize: 11 }}>현재가 · {x.bids}입찰</span>
              <span className="row" style={{ gap: 5, color: 'var(--amber)' }}>
                <Icon name="clock" size={13} /><span className="mono" style={{ fontSize: 12 }}>{x.endsIn}</span>
              </span>
            </div>
            <div className="between" style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--ff-display)', fontSize: 18 }}>퍼즐 {x.bid}</span>
              <button className="btn btn-holo btn-sm">입찰</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 'auto' }}>
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}><span className="faint">원함 · </span>{x.want}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }}>교환 제안 <Icon name="swap" size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Exchange() {
  const [kind, setKind] = useState('전체');
  const list = DATA.EXCHANGES.filter((x) => kind === '전체' || x.kind === kind);
  return (
    <div className="screen">
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="between" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Card Exchange</div>
            <h1 className="h-xl">카드 교환 마켓</h1>
            <p className="muted" style={{ marginTop: 10 }}>팬들끼리 직거래·경매로 한정 카드를 교환하세요.</p>
          </div>
          <div className="col" style={{ alignItems: 'flex-end', gap: 12 }}>
            <button className="btn btn-holo"><Icon name="plus" size={16} /> 교환 등록</button>
            <span className="faint mono" style={{ fontSize: 11 }}>수수료 · 등록 시 퍼즐 50개</span>
          </div>
        </div>
        <div className="wrapgap" style={{ marginTop: 26 }}>
          {['전체', '직거래', '경매'].map((k) => (
            <button key={k} className={'chip' + (kind === k ? ' on accent' : '')} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: 24 }}>
          {list.map((x) => <ExchangeCard key={x.id} x={x} />)}
        </div>
      </div>
    </div>
  );
}
